# Backend do Unmute — preparação

Nenhum projeto foi criado ou vinculado, nenhuma migration foi aplicada e nenhuma tabela do LUNOR foi consultada ou alterada nesta entrega.

## Primeiro esquema proposto

| Entidade           | Finalidade                                   | Controle esperado                                      |
| ------------------ | -------------------------------------------- | ------------------------------------------------------ |
| profiles           | Preferências e objetivo do aluno             | Usuário acessa seu próprio registro                    |
| lesson_sessions    | Conclusões e prática                         | Dono da sessão; escrita validada                       |
| speech_attempts    | Metadados da tentativa, sem áudio permanente | Dono e backend autorizado                              |
| feedback           | Resultado da avaliação                       | Leitura pelo dono; escrita exclusivamente pelo backend |
| usage_reservations | Reserva atômica de cota e idempotência       | Backend; sem mutação pelo cliente                      |

O conteúdo inicial continua versionado no código até existir necessidade de autoria remota. Índices, constraints, permissões e políticas devem nascer junto com cada tabela, com migrations geradas pelo CLI.

## Isolamento obrigatório

RLS em todas as tabelas expostas. Políticas de leitura/escrita limitam por identidade de sessão, sem depender de metadados editáveis pelo usuário. UPDATE precisa de seleção permitida e verificação tanto da linha atual quanto da nova. Grants de tabela e políticas RLS são verificados separadamente.

Não colocar resultados ou cotas sob controle do cliente. Não usar funções privilegiadas para contornar problemas de permissão. Evitar guardar áudio; se necessário, usar bucket privado, expiração e política explícita de exclusão.

## Sequência de implementação

1. Identificar o projeto exclusivo e confirmar região/custo antes de criar infraestrutura que cobre uso.
2. Conferir versão e ajuda do CLI, inicializar configuração e ambiente local.
3. Criar o esquema mínimo, rodar advisors e testar acessos de dois usuários distintos e um visitante.
4. Gerar a migration pelo CLI e recriar o banco local do zero.
5. Gerar tipos, integrar Auth e só depois implementar o processamento de voz.

O [changelog](https://supabase.com/changelog.md) foi consultado em 11/09/2026. A mudança recente de templates de e-mail no plano Free precisa ser considerada se personalizarmos mensagens de autenticação; outros breaking changes consultados não se aplicam à fundação local. Revisar novamente ao implementar.

Referências: [React Native e Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [segurança da Data API](https://supabase.com/docs/guides/api/securing-your-api), [changelog de templates de e-mail](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier).
