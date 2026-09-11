# Arquitetura — fundação 0.1

## Decisão

Um aplicativo Expo com domínios separados, conectado posteriormente a um projeto Supabase exclusivo do Unmute. Voz e contexto pedagógico fazem parte do domínio desde o início; nenhum dado ou infraestrutura do LUNOR é reutilizado.

O primeiro incremento é a prática local verificável. O próximo fecha o ciclo autenticado de ouvir, responder e receber uma correção específica. Não há microsserviços nem servidor dedicado nesta fundação.

## Fronteiras

| Origem                         | Destino                    | Responsabilidade                                                 |
| ------------------------------ | -------------------------- | ---------------------------------------------------------------- |
| Tela                           | Domínio de aprendizado     | Validar objetivo, selecionar treino e registrar conclusão        |
| Domínio                        | Armazenamento local        | Persistir preferências e conclusões, sem arquivos de voz         |
| Aplicativo autenticado, futuro | Supabase                   | Ler e gravar somente dados autorizados por RLS                   |
| Aplicativo autenticado, futuro | Edge Function de avaliação | Enviar tentativa limitada, após consentimento para processamento |
| Edge Function, futuro          | OpenAI                     | Transcrever e avaliar com credencial privada                     |

O cliente nunca decide a identidade autorizada, o orçamento de uso nem o resultado final de uma avaliação. O servidor identifica o usuário pela sessão validada.

## Decisões da fundação

1. Expo SDK 57, React Native 0.86.3 e React 19.2.3 vieram do template oficial consultado em 11/09/2026. Dependências nativas seguem a matriz do próprio SDK. O lockfile é obrigatório.
2. Rotas ficam em `app/`; regras de aprendizado e áudio ficam em `src/features/`. A estrutura é pequena e cresce com funcionalidades efetivas.
3. O estado local usa Contexto React. TanStack Query entra com as primeiras consultas remotas; Zustand será avaliado se o estado compartilhado justificar. Não instalamos bibliotecas de estado sem uso.
4. A interface inicial usa `StyleSheet` e um tema compartilhado. NativeWind permanece opcional. Não é necessário para validar a primeira experiência.
5. Treinos autorais de escopo pequeno são versionados. Este conteúdo é iniciante, sem pretender cobrir A1–C1 nem substituir um currículo validado.
6. Meta diária, volume de prática, diagnóstico e fluência são conceitos distintos. Nunca calcular “nível de inglês” apenas por tempo, repetições ou transcrição.
7. Perfis de build EAS estão definidos. Antes de usar development builds, instalar a versão de expo-dev-client compatível com o SDK. Projeto EAS, credenciais de assinatura e builds ainda não foram criados.

## Persistência local

Formato versionado e validado com Zod. Escritas são serializadas para evitar perda por operações concorrentes. A interface só apresenta salvamento concluído após a escrita terminar. JSON inválido ou versão desconhecida bloqueiam gravação em vez de apagar silenciosamente o histórico.

Conclusões usam um identificador estável da sessão. Repetir o mesmo salvamento não aumenta estatísticas. Há retenção explícita das últimas 500 conclusões. São armazenados segundos da tentativa aceita em cada frase; tentativas descartadas não entram nos totais. Não há nível, nota de pronúncia ou estimativa de domínio nesta entrega.

## Integração e evolução

Não criar um conjunto grande de tabelas antecipadamente. Começar pelo mínimo do fluxo autenticado e gerar tipos a partir do banco. Para habilitar IA: autenticação, RLS testada, upload temporário, validação de formato/tamanho, limite distribuído de uso, timeout, tratamento de indisponibilidade e exclusão do áudio precisam fazer parte da mesma entrega.

## Referências oficiais

- [Matriz do Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router](https://docs.expo.dev/router/installation/)
- [Gravação e reprodução](https://docs.expo.dev/versions/v57.0.0/sdk/audio/)
- [Supabase com React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native)

Essas referências apoiam a arquitetura. Integrações planejadas ainda exigem validação no projeto real.
