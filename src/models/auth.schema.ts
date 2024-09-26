import { authSequelize } from '@auth/database';
import { IAuthDocument } from '@greatdaveo/jobint-shared';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';
import { compare, hash } from 'bcryptjs';

const salt = 10;

// To correct the prototype error
interface AuthModelInstanceMethods extends Model {
  prototype: {
    comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
    hashPassword: (password: string) => Promise<string>;
  };
}

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods = authSequelize.define(
  'auths',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    profilePublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false
    },

    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false
    },

    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },

    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now
    },

    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },

    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['emailVerificationToken']
      }
    ]
  }
) as ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods;

// To Hash the password before it is save to the database
AuthModel.addHook('beforeCreate', async (auth: Model) => {
  const hashedPassword: string = await hash(auth.dataValues.password as string, 10);
  auth.dataValues.password = hashedPassword;
});

// To compare the user password
AuthModel.prototype.comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
};

AuthModel.prototype.hashPassword = async function (password: string): Promise<string> {
  return hash(password, 10);
};

AuthModel.sync({}); // To create the table if it doesn't exist
export { AuthModel };
