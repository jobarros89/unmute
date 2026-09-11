# IA e voz

## Estado atual

A prática guiada usa voz sintética do dispositivo e reprodução da própria gravação. Nenhuma chamada OpenAI está implementada ou ativada. Não existe avaliação automática ou nota de pronúncia.

A criação de uma chave exclusiva foi autorizada pelo fundador, mas não foi executada: o formulário de confirmação do destino local retornou erro técnico. Nenhum segredo foi gravado no repositório.

## Próximo fluxo

O mobile envia uma tentativa curta ao backend autenticado. O backend valida usuário, exercício, tamanho e formato; reserva a cota da tentativa de forma atômica; transcreve; valida a resposta; devolve feedback estruturado. Um identificador de tentativa permite repetição idempotente sem cobrança duplicada pelo aplicativo.

As chaves privadas nunca passam pelo mobile. O backend não confia em `user_id` enviado pelo cliente. Prompts, modelos e limites são controlados no servidor. O texto transcrito é conteúdo do aluno e nunca uma instrução para alterar regras do sistema.

## Feedback útil e verificável

O contrato inicial está em `src/features/conversation/contracts.ts`. A resposta deve identificar a tentativa, mostrar a transcrição, explicar no máximo duas correções e sugerir uma resposta melhor e uma próxima tentativa. Se o áudio não estiver compreensível, retornar um estado próprio pedindo nova gravação.

Transcrição textual não é uma avaliação acústica de pronúncia. Não gerar percentual de pronúncia, fluência ou nível CEFR a partir de uma transcrição. Qualquer futura avaliação de fala precisa de critérios, evidência de validade e indicação de incerteza.

## Seleção de modelo

A documentação consultada apresenta a API de transcrição de arquivos e o modelo `gpt-transcribe`. A escolha final depende de acesso no projeto, custo e teste com gravações curtas de falantes brasileiros. Não há modelo fixado no código nesta entrega e não há custo de IA para executar a prática local.

Começar com turnos de áudio curtos facilita medir qualidade e custo. Conversação em tempo real será avaliada após esse fluxo funcionar em aparelhos reais. Em uma futura conexão Realtime direta, o mobile só poderá usar credencial efêmera emitida pelo backend, nunca a chave permanente.

## Condições para ativação

- Autenticação real e verificação do usuário pelo servidor.
- Limites distribuídos por usuário e por período, antes de acessar a API.
- Duração, bytes e tipos de áudio permitidos; timeout e limite de saída.
- Consentimento para envio e regra explícita de retenção/exclusão.
- Resposta com esquema validado e tratamento de áudio vazio/incompreensível.
- Logs operacionais com identificadores, latência e consumo, sem texto sensível.
- Teste real autorizado, com resultado e custo observáveis.

Referências: [transcrição de arquivos](https://developers.openai.com/api/docs/guides/speech-to-text) e [conexão Realtime por WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc). A segunda é referência para uma fase futura; não foi implementada neste PR.
