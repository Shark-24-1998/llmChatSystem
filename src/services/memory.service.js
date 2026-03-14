const MAX_MESSAGES = 10;

export const buildConversation = (messages, newMessage) => {

  const history = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  history.push({
    role: "user",
    content: newMessage
  });

  if (history.length > MAX_MESSAGES) {
    return history.slice(-MAX_MESSAGES);
  }

  return history;

};