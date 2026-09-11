# Unmute

**Seu inglês. Na vida real.**

Aplicativo Expo para treinos curtos de listening, repetição e conversa. Esta branch evolui a base de `feat/bootstrap-mobile`; preserva o treinamento local e adiciona o fluxo autenticado.

## Estado real da entrega

O código da aplicação e do backend está implementado. **O projeto Supabase está ativo em São Paulo, a migration foi aplicada e a função coach está publicada. A credencial Cloudflare Workers AI e os ajustes de e-mail/Auth ainda estão pendentes; não há publicação do cliente nem APK/IPA nesta entrega.** Contas, sincronização e coach exigem esses serviços. Sem configuração, o aplicativo oferece prática local e informa que as contas ainda não estão disponíveis.

| Funcionalidade        | Implementação                                                                       |
| --------------------- | ----------------------------------------------------------------------------------- |
| Onboarding            | Nome, objetivo e meta diária de 5, 10 ou 20 minutos                                 |
| Plano diário          | Distribuição do tempo entre treino guiado, conversa e revisão                       |
| Listening e shadowing | Nove frases autorais, voz do aparelho, tradução e adaptação                         |
| Gravação              | Tentativas de até 30 segundos e reprodução local                                    |
| Conta                 | E-mail/senha, confirmação por código, recuperação por código e saída                |
| Sincronização         | Perfil e conclusões por usuário; gravação confirmada após resposta do banco         |
| Diagnóstico           | Três itens de listening e autorrelato de conforto ao falar; não certifica CEFR      |
| Unmute Rooms          | Aeroporto, trabalho e cafeteria; voz ou texto com contexto das últimas interações   |
| Coach                 | Transcrição e feedback de linguagem por Edge Function; GPT-5 no servidor            |
| Revisão               | Correções reais das conversas; intervalos de 10 minutos a 30 dias                   |
| Progresso             | Histórico, repetições, duração gravada e sequência de dias locais                   |
| Segurança             | RLS, acesso privilegiado só no servidor, cotas transacionais e validação de entrada |

Não implementados: currículo completo A1–C1, avaliação acústica de pronúncia, comparação de gravações entre semanas, assinaturas, notificações e publicação nas lojas. O diagnóstico curto e o tempo praticado não são medidas comprovadas de fluência.

## Rodar

Node.js 24 e npm:

```bash
npm ci
npm run web
# Ou: npm start, para Expo Go compatível com SDK 57
```

Para habilitar o backend, preencher os valores públicos de `.env.example` em `.env.local`. A credencial Cloudflare Workers AI pertence apenas às Edge Functions. Nunca colocar segredos em `EXPO_PUBLIC_*`.

## Validar

```bash
npm run check
npm run export:web
npm run export:native
npx deno check supabase/functions/coach/index.ts
```

Os testes de banco executam a migration em PostgreSQL embutido (PGlite), com papéis e função `auth.uid()` de teste. Não substituem um teste de integração na instância real do Supabase. Exportar os bundles não gera APK/IPA nem testa microfone ou e-mail no aparelho.

## Dados

O modo local mantém até 500 conclusões neste aparelho. Contas usam o banco remoto; o histórico local não é importado automaticamente. Cada conta recebe estado separado, evitando misturar dados em aparelhos compartilhados. O histórico autenticado requer conexão e não é apresentado como sincronizado quando a gravação falha.

Áudio é temporário e só é enviado ao coach após a ação de envio. O backend encaminha o arquivo à Cloudflare Workers AI sem armazená-lo em bucket. Transcrição, resposta e correção são salvas na conta; não há gravação permanente para comparações semanais. Políticas de retenção do provedor ainda se aplicam ao processamento.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Ativação da infraestrutura](docs/deployment.md)
- [Banco e políticas](supabase/README.md)
- [IA e limites](docs/ai.md)
- [Verificação](docs/testing.md)

Alterações seguem por branch e PR. Nenhum deploy é disparado implicitamente ao fazer commit.
