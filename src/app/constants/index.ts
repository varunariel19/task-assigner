const BASE_URL = 'http://localhost:4000/api';

const apiEndPoints = {
  tokenValidation: `${BASE_URL}/validate-token`,
  updateticket: `${BASE_URL}/update-ticket`,
  editComment: `${BASE_URL}/edit-comment`,
  uploadTicket: `${BASE_URL}/upload-task`,
  allTasks: `${BASE_URL}/fetch-all-task`,
  addComment: `${BASE_URL}/add-comment`,
  allComments: `${BASE_URL}/comments`,
  allUsers: `${BASE_URL}/all-users`,
  register: `${BASE_URL}/register`,
  login: `${BASE_URL}/login`,
  geminiApiKey: "AIzaSyAl-8iyB_WDpGjwU4ZdcUDZuiqF6eR3rys",

}

const aiPrompt = (script: string, dynamicPayload: string) => {
  return `
  You are given the content information anlyze and responsed accordingly below.
  
  Task:
  1. Analyze the content carefully.
  2. Remove any filler, suggestions, disclaimers, or non-informational text.
  4. Include only key facts, decisions, issues, and actions.
  5. Do not add introductions, explanations, or conclusions.
  6. Do not repeat or paraphrase the instructions.
  
  ${script}
  ${dynamicPayload}
  `;
}

export type Script = keyof typeof scripts;
const scripts = {
  CHAT_SUMMARY: {
    script: `
        1. Below the chat relevant data...
        2. Produce a concise chat summary in bullet points.
        3. Generate content strictly from the information provided.
        4. Stay fully aligned with the context.
      `,
    generatePrompt: (payload: string) =>
      aiPrompt(scripts.CHAT_SUMMARY.script, payload),
  },

  CHAT_SUGGESTION: {
    script: `
        1. Below are the ticket details and message type.
        2. Suggest an informative and context-related message.
        3. Stay fully aligned with the provided information.
        4. Keep the message concise and one line .
        5. I just need the message remove any other extra content just the message only.
      `,
    generatePrompt: (payload: string) =>
      aiPrompt(scripts.CHAT_SUGGESTION.script, payload),
  },
} as const;





export { apiEndPoints, scripts }