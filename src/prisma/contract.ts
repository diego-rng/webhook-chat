import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv4String(),
      username: field.text(),
      name: field.text().optional(),
      active: field.boolean(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
      email: field.text().unique(),
    },
  });

  const Conversation = model('Conversation', {
    fields: {
      id: field.id.uuidv4String(),
      created_by: field.text(),
      conversation_name: field.text().optional(),
    },
  });

  const Message = model('Message', {
    fields: {
      id: field.id.uuidv4String(),
      sent_by: field.text(),
      conversation_id: field.text(),
      content: field.text(),
      attachment: field.text().optional(),
    },
  });

  const ConversationParticipant = model('ConversationParticipant', {
    fields: {
      id: field.id.uuidv4String(),
      user_id: field.text(),
      conversation_id: field.text(),
    },
  });

  const UserCredentials = model('UserCredentials', {
    fields: {
      id: field.id.uuidv4String(),
      user_id: field.text(),
      username: field.text().unique(),
      password: field.text(),
    },
  });

  return {
    models: {
      User: User.relations({
        created_conversations: rel.hasMany(Conversation, { by: 'created_by' }),
        participating_conversations: rel.hasMany(ConversationParticipant, {
          by: 'user_id',
        }),
        messages: rel.hasMany(Message, { by: 'sent_by' }),
      }),
      Conversation: Conversation.relations({
        author: rel.belongsTo(User, { from: 'created_by', to: 'id' }),
        participants: rel.hasMany(ConversationParticipant, {
          by: 'conversation_id',
        }),
        messages: rel.hasMany(Message, { by: 'conversation_id' }),
      }),
      ConversationParticipant: ConversationParticipant.relations({
        user: rel.belongsTo(User, { from: 'user_id', to: 'id' }),
        conversation: rel.belongsTo(Conversation, {
          from: 'conversation_id',
          to: 'id',
        }),
      }),
      Message: Message.relations({
        author: rel.belongsTo(User, { from: 'sent_by', to: 'id' }),
        conversation: rel.belongsTo(Conversation, {
          from: 'conversation_id',
          to: 'id',
        }),
      }),
      UserCredentials: UserCredentials.relations({
        author: rel.belongsTo(User, { from: 'user_id', to: 'id' }),
      }),
    },
  };
});
