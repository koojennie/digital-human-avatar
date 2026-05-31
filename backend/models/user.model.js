import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js';

class User extends Model {}

User.init({
  user_id: {
    type: DataTypes.CHAR(8),
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { isEmail: true },
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default User;