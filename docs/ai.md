# Coach Unmute

Implementado em `supabase/functions/coach/index.ts`. Publicado no projeto Unmute, versão 2, adaptado para Workers AI. Sem CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_AI_API_TOKEN configurada, a análise retorna indisponibilidade; não foi validada com uma chamada real ao provedor.

- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` via Cloudflare Workers AI REST para feedback de gramática, vocabulário e continuação da conversa.
- `@cf/openai/whisper-large-v3-turbo`, hospedado na Cloudflare, para voz; síntese das frases e respostas usa a voz inglesa do dispositivo via expo-speech.
- Resposta JSON estruturada e validada. A transcrição exibida é a fornecida pelo transcritor, nunca uma nova transcrição inventada pelo coach.
- Contexto das últimas seis interações concluídas, filtrado por usuário e conversa no servidor.
- Cenários curados: aeroporto, trabalho, cafeteria e prática de uma frase.
- Sem credencial de IA no cliente. Token de sessão validado no servidor com getUser.
- Limite transacional de 30 pedidos por usuário/dia UTC, incluindo falhas depois da reserva. Não é um teto financeiro global: acompanhar também os limites e o consumo na conta Cloudflare antes de abrir o cadastro ao público.
- Corpo limitado durante leitura, arquivo de áudio de até 4 MB e formato permitido; o gravador do app limita a 30 segundos. O backend limita bytes, não certifica duração acústica.
- Timeout por chamada; falhas retornam estado explícito sem simular uma correção.
- Sem áudio no bucket e sem textos/áudio/tokens em logs. Logs contêm evento, id da tentativa, categoria do erro e duração.
- Consentimento informado no botão de envio. A transcrição e a correção ficam na conta. As regras de retenção do provedor continuam aplicáveis.

Feedback de texto não mede qualidade acústica, pronúncia, fluência ou CEFR. Resultados devem ser validados por revisão pedagógica e testes de uso antes de uma promessa comercial de progressão.

Referências: [JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), [Whisper](https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/), [REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).
