# Trabalhar no Unmute

- Este repositório é independente do LUNOR. Não usar projetos, dados ou credenciais dele.
- Ler README e docs/architecture.md antes de mudanças estruturais.
- Expo SDK 57: consultar a documentação versionada e a matriz bundledNativeModules para dependências nativas.
- Fazer alterações por branch e PR; preservar o lockfile. Não executar deploy implícito junto com um commit.
- Manter rotas em app/, domínios em src/features/ e componentes compartilhados em src/components/.
- APIs privadas e credenciais privilegiadas pertencem ao backend. Nunca expor em EXPO_PUBLIC_*.
- Não apresentar simulação, tempo de prática ou transcrição como avaliação comprovada de fluência/pronúncia.
- Validar a alteração com npm run check e os bundles afetados. Documentar testes não executados e dependências externas pendentes.
- Não adicionar bibliotecas, tabelas ou abstrações sem uma funcionalidade que as utilize.
