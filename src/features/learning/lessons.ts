import type { Settings } from "./model";

export type Exercise = {
  phrase: string;
  translation: string;
  tip: string;
  challenge: string;
};
export type Lesson = {
  id: Settings["goal"];
  title: string;
  subtitle: string;
  exercises: Exercise[];
};
export const lessons: Lesson[] = [
  {
    id: "everyday",
    title: "Seu dia, em inglês",
    subtitle: "Rotina, planos e família",
    exercises: [
      {
        phrase: "I usually have coffee in the morning.",
        translation: "Eu geralmente tomo café de manhã.",
        tip: "“Usually” indica um hábito. Tente perceber a frase inteira, sem traduzir palavra por palavra.",
        challenge: "Troque “coffee” por algo que faz parte da sua manhã.",
      },
      {
        phrase: "What are you doing tonight?",
        translation: "O que você vai fazer hoje à noite?",
        tip: "“What are you doing” também pode perguntar sobre um plano já combinado.",
        challenge: "Troque “tonight” por “tomorrow”.",
      },
      {
        phrase: "I'm staying home with my family.",
        translation: "Vou ficar em casa com minha família.",
        tip: "“I’m” é a forma contraída de “I am”. Ouça como as palavras se conectam.",
        challenge: "Responda à pergunta anterior contando seu plano real.",
      },
    ],
  },
  {
    id: "work",
    title: "Sua voz no trabalho",
    subtitle: "Apresentar-se e pedir clareza",
    exercises: [
      {
        phrase: "I work in technology.",
        translation: "Eu trabalho com tecnologia.",
        tip: "Use “I work in” para falar sobre sua área de atuação.",
        challenge: "Substitua “technology” pela sua área.",
      },
      {
        phrase: "Could you explain that again?",
        translation: "Você poderia explicar isso de novo?",
        tip: "“Could you” é uma forma educada de fazer um pedido.",
        challenge: "Experimente: “Could you say that again?”",
      },
      {
        phrase: "Let me check and get back to you.",
        translation: "Vou verificar e te dar um retorno.",
        tip: "“Get back to you” significa retornar com uma resposta.",
        challenge: "Acrescente “tomorrow” para combinar quando dará o retorno.",
      },
    ],
  },
  {
    id: "travel",
    title: "Uma pausa para o café",
    subtitle: "Pedir, entender e agradecer",
    exercises: [
      {
        phrase: "I'd like a coffee, please.",
        translation: "Eu gostaria de um café, por favor.",
        tip: "“I’d like” é uma forma educada e comum de pedir algo.",
        challenge: "Peça um chá: substitua “a coffee” por “a tea”.",
      },
      {
        phrase: "How much is it?",
        translation: "Quanto custa?",
        tip: "Ouça “much is” como uma sequência conectada.",
        challenge:
          "Imagine o atendente respondendo “Three dollars”. Agradeça em inglês.",
      },
      {
        phrase: "Could you say that again, please?",
        translation: "Você poderia repetir, por favor?",
        tip: "Você pode usar essa frase sempre que não entender o que alguém disse.",
        challenge: "Tente também: “Could you speak more slowly, please?”",
      },
    ],
  },
];

export function findLesson(id: string | undefined) {
  return lessons.find((lesson) => lesson.id === id);
}
