# Backend Unmute

Migration `20260911153116_authenticated_learning.sql` gerada pela CLI e validada em PostgreSQL embutido. **Aplicada no projeto Unmute `zzggiswlsgnanargqgir`, região `sa-east-1`.** O nome do arquivo foi alinhado à versão registrada pela migration remota.

| Tabela           | Acesso do aplicativo                                               |
| ---------------- | ------------------------------------------------------------------ |
| profiles         | Ler, criar e alterar apenas o próprio perfil                       |
| lesson_sessions  | Ler e inserir conclusões próprias; chave composta evita duplicação |
| assessments      | Ler e inserir amostras de diagnóstico próprias                     |
| ai_turns         | Somente ler as próprias respostas; escrita só pelo backend         |
| review_items     | Ler próprias correções; alterar somente repetitions e due_at       |
| private.ai_usage | Sem acesso do cliente; cota diária por usuário em UTC              |

RLS em todas as tabelas, inclusive na tabela privada. Grants explícitos. `reserve_ai_turn` e `finish_ai_turn` usam `SECURITY INVOKER`; execução revogada de PUBLIC/anon/authenticated e concedida apenas a service_role. Não usam metadata controlada pelo usuário para autorização.

A reserva de tentativa e o débito de cota acontecem na mesma transação com lock por usuário/dia. Uma tentativa repetida com a mesma chave não consome outra cota; uma chave reaproveitada com outro conteúdo é rejeitada. Erros de provedor continuam contando no orçamento conservador de 30 interações/dia. A conclusão e a criação de revisão são atômicas.

Nenhum bucket é necessário nesta versão: áudio é enviado diretamente à função e não armazenado. Ao implementar comparação de gravações, criar bucket privado, consentimento específico e retenção antes de habilitar uploads persistentes.

Veja [ativação](../docs/deployment.md) para provisionamento, templates de e-mail, segredos e testes reais pendentes.
