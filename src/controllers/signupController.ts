import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, firstLetterUppercase, lowerCase, uploads } from '@greatdaveo/jobint-shared';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';

export async function signupUser(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));

  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signup User Method error');
  }

  const { username, email, password, country, profilePicture } = req.body;
  //   To check if user exist
  const checkIfUserExist: IAuthDocument = await getUserByUsernameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new BadRequestError('Invalid credentials. Email or Username exist', 'signupUser method error');
  }

  //   To create profile public Id
  const profilePublicId = uuidV4();
  //   To upload
  const uploadResult: UploadApiResponse = (await uploads(profilePicture, `${profilePublicId}`, true, true)) as UploadApiResponse;
  //   If there is public id in the response then, there is an error
  if (!uploadResult.public_id) {
    throw new BadRequestError('Error uploading file, Try again', 'signupUser method error');
  }

  //   To generate random characters for email verification token
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  //   To convert to hexadeximal characters
  const randomCharacters: string = randomBytes.toString('hex');
  //   To set up the data to be saved to the DB
  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    country,
    profilePicture: uploadResult?.secure_url,
    emailVerificationToken: randomCharacters
  } as IAuthDocument;
  // To save to the db
  const result: IAuthDocument = await createAuthUser(authData);
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  //   To publish message details to the user service
  await publishDirectMessage(
    authChannel, // Channel
    'jobint-email-notification', // Exchange
    'auth-email', // Routing Key
    JSON.stringify(messageDetails), // Message
    'Verify email message has been sent to notification service.' // Log Value
  );
  const userJWT: string = signToken(result.id!, result.email!, result.username!);
  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
}
