import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js';

class Conversation extends Model {}

Conversation.init({
  conversation_id: {
    type: DataTypes.CHAR(8),
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    references: { model: 'users', key: 'user_id' },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  sequelize,
  modelName: 'Conversation',
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Conversation;