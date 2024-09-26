import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase, lowerCase } from '@greatdaveo/jobint-shared';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op, where } from 'sequelize';

// CREATE USER SERVICE METHOD
export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
  // To create a new user
  const result: Model = await AuthModel.create(data);
  // To create a new buyer to be saved in the MongoDB
  const messageDetails: IAuthBuyerMessageDetails = {
    username: result.dataValues.username!,
    email: result.dataValues.email!,
    profilePicture: result.dataValues.profilePicture!,
    country: result.dataValues.country!,
    createdAt: result.dataValues.createdAt!,
    type: 'auth'
  };
  //   To publish message to the user service
  await publishDirectMessage(
    authChannel, // Channel
    'jobint-buyer-update', // Exchange
    'user-buyer', // Routing Key
    JSON.stringify(messageDetails), // Message
    'Buyer details sent to buyer service' // Log Value
  );

  //   To remove password from the userData to be sent to the frontend
  const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
  return userData;
}

// TO GET A USER BY ID
export async function getAuthUserById(authId: number): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: { id: authId },
    attributes: {
      exclude: ['password']
    }
  })) as Model;
  return user.dataValues;
}

// TO GET USER BY EMAIL OR USERNAME
export async function getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    // To check for document that matches the username or email
    where: {
      [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
    }
  })) as Model;
  return user.dataValues;
}

// TO GET USER BY USERNAME
export async function getUserByUsername(username: string): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    // To check for document that matches the username
    where: { username: firstLetterUppercase(username) }
  })) as Model;

  return user.dataValues;
}

// TO GET USER BY EMAIL
export async function getUserByEmail(email: string): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    // To check for document that matches the email
    where: { email: lowerCase(email) }
  })) as Model;

  return user.dataValues;
}

// TO GET USER BY Email VERIFICATION TOKEN
export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    // To check for document that matches the username or email
    where: { emailVerificationToken: token },
    attributes: {
      exclude: ['password']
    }
  })) as Model;

  return user.dataValues;
}

// TO GET USER Password Token when the user is logged in and want to update their password
export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    // To check for document that matches the username or email
    where: {
      [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
    }
  })) as Model;

  return user.dataValues;
}

// TO UPDATE THE USER DATA
// For verify email field and email verification token
export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> {
  await AuthModel.update({ emailVerified, emailVerificationToken }, { where: { id: authId } });
}

// To update password token, when the user changes password when logged in
export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  await AuthModel.update({ passwordResetToken: token, passwordResetExpires: tokenExpiration }, { where: { id: authId } });
}

// To update the password field
export async function updatePassword(authId: number, password: string): Promise<void> {
  await AuthModel.update({ password, passwordResetToken: '', passwordResetExpires: new Date() }, { where: { id: authId } });
}

// To create a method to sign token
export function signToken(id: number, email: string, username: string): string {
  return sign({ id, email, username }, config.JWT_TOKEN!);
}
