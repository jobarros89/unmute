# Unmute

**Seu inglês. Na vida real.**

Aplicativo de inglês para quem quer compreender conversas e destravar a fala com treinos que cabem no dia a dia.

O ciclo do produto é **ouvir → entender → falar → receber feedback → repetir em outro contexto**. Esta primeira entrega implementa a fundação mobile e uma prática guiada local. A correção por IA ainda não está conectada.

## O que já existe

- Onboarding com nome opcional, objetivo e meta diária de 5, 10 ou 20 minutos.
- Navegação entre Hoje, Praticar e Meu progresso.
- Três treinos autorais: cotidiano, trabalho e viagem, com nove frases ao todo.
- Reprodução em inglês e velocidade reduzida, usando a voz do aparelho.
- Revelação da tradução, dica de uso e desafio de adaptação da frase.
- Gravação de até 30 segundos, reprodução da própria voz e nova tentativa.
- Histórico local de treinos concluídos, repetições e segundos nas gravações aceitas.
- Validação de dados, prevenção de conclusão duplicada e proteção contra sobrescrever histórico inválido.
- Testes de domínio e workflow de CI para verificar tipos, testes e bundles mobile/web.

**Ainda não implementado:** login, banco remoto, sincronização, diagnóstico de nível, correção por IA, conversação livre, revisão adaptativa, notificações ou cobrança. A meta diária é uma preferência; ainda não há motor que distribua o tempo em um plano personalizado.

## Rodar

Pré-requisito: Node.js 24 e npm. As versões estão fixadas no `package-lock.json`.

```bash
npm ci
npm start
```

Abra com uma versão do Expo Go compatível com o SDK 57 ou com um development build. Para verificar as telas no navegador:

```bash
npm run web
```

O treino local funciona sem Supabase e sem chave de IA. O aparelho precisa de uma voz inglesa disponível. No iPhone, confira o volume e o modo silencioso. No navegador, o microfone exige localhost ou HTTPS e depende do suporte do navegador.

## Validar

```bash
npm run check
npm run export:web
npm run export:native
```

Exportar os bundles **não gera APK/IPA** e não comprova funcionamento do microfone em um telefone. O roteiro de teste real está em [docs/testing.md](docs/testing.md).

## Arquitetura

| Camada     | Nesta entrega                                   | Próxima integração                                                 |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Aplicativo | Expo 57, React Native, TypeScript, Expo Router  | Development build e distribuição de teste                          |
| Interface  | Componentes próprios e tema compartilhado       | Refinamento com feedback do piloto                                 |
| Estado     | Contexto React e AsyncStorage com validação Zod | Cache de dados remotos quando houver backend                       |
| Áudio      | expo-speech e expo-audio                        | Transcrição e feedback pelo backend                                |
| Backend    | Arquitetura e contrato documentados             | Supabase próprio do Unmute: Auth, PostgreSQL, RLS e Edge Functions |
| IA         | Contrato validado, sem chamadas                 | OpenAI no backend, com autenticação e orçamento de uso             |
| Qualidade  | Node test runner, TypeScript, CI                | Testes de RLS e integração real                                    |

- [Arquitetura e decisões](docs/architecture.md)
- [Produto e marcos](docs/product.md)
- [Integração de IA](docs/ai.md)
- [Preparação do banco](supabase/README.md)
- [Testes e limites de validação](docs/testing.md)

## Organização

- `app/`: rotas e composição das telas.
- `src/features/learning/`: conteúdo inicial, modelos, validação e persistência.
- `src/features/speaking/`: gravação e reprodução da voz.
- `src/features/conversation/`: contrato para a futura avaliação.
- `src/components/`: componentes e tema compartilhados.
- `supabase/`: decisões para a futura configuração do backend.
- `tests/`: regras de domínio.
- `.github/workflows/`: validação de alterações.

## Dados e credenciais

O histórico fica apenas neste aparelho, com as 500 conclusões mais recentes. Desinstalar ou limpar os dados do app pode removê-lo. Gravações são temporárias e a aplicação tenta apagá-las ao repetir ou sair; uma interrupção abrupta pode deixar arquivos no cache até sua limpeza pelo sistema. Nenhum áudio é enviado para a nuvem nesta versão.

Segredos de OpenAI e chaves privilegiadas de Supabase pertencem exclusivamente ao backend. Arquivos de ambiente locais são ignorados pelo Git. Não adicione segredos a `EXPO_PUBLIC_*`, `app.json` ou ao código mobile.

Mudanças seguem por branch e pull request. A presença do workflow não significa que a proteção da branch já foi configurada. Não há deploy automático neste repositório.
