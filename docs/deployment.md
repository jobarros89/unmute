# Ativação da infraestrutura

## Pendências externas reais

1. Escolher a organização para o novo projeto Supabase `Unmute`. A integração exige escolha explícita da organização e confirmação do custo retornado. A única organização encontrada foi `jobarros89`; ainda não foi selecionada pelo usuário para este projeto.
2. Criar projeto separado, preferencialmente em São Paulo (`sa-east-1`), após a confirmação de custo. Não reutilizar o projeto LUNOR.
3. Configurar a chave OpenAI pelo fluxo seguro. A criação já foi autorizada em conversa anterior, mas falhou com 401 naquele momento; nenhuma chave foi encontrada neste ambiente. Não pedir que o usuário cole uma chave no chat.
4. Aplicar migration, configurar Auth e publicar `coach`; testar antes de publicar o cliente.
5. Registrar o projeto EAS e configurar assinatura para distribuir APK/IPA. Os perfis existentes são configuração de código, não builds concluídos.

## Aplicar banco e função

CLI validada: Supabase 2.101.0. Autenticar pela conta e vincular **o projeto exclusivo do Unmute**. Executar a migration de `supabase/migrations/` com `apply_migration` no MCP, ou `supabase db push --linked` após o vínculo. Nunca fazer reset de banco remoto.

Configurar no Auth real:

- Confirmação de e-mail habilitada e senha mínima de 12 caracteres.
- Templates `supabase/templates/confirmation.html` e `recovery.html`, com `{{ .Token }}`. As telas usam códigos, não dependem de links de redirecionamento.
- SMTP adequado para e-mails aos usuários do piloto. Verificar limites e entrega com endereços reais antes de liberar cadastro.
- `site_url` e URLs de redirecionamento com os endereços reais da publicação. Os endereços locais do `config.toml` são somente desenvolvimento.

Não enviar o `config.toml` inteiro para produção sem substituir esses valores locais e revisar o diff de configuração.

A função tem `verify_jwt = false` no gateway para suportar a autenticação feita no código. Isso **não** libera o endpoint: ele exige Bearer token, chama `auth.getUser(token)`, rejeita usuários anônimos e só então acessa o banco e a IA.

```bash
npx supabase@2.101.0 functions deploy coach --project-ref <ref-do-unmute> --use-api
```

Definir `OPENAI_API_KEY` como segredo da Edge Function pelo mecanismo seguro. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo runtime Supabase. Não copiar a chave privilegiada para o aplicativo.

Após aplicar, gerar tipos do banco real, executar advisors, testar dois usuários separados e confirmar que um não lê nem altera os dados do outro. Verificar limites de uso, logs sem conteúdo sensível, e erro 401 sem autenticação.

## Cliente web e mobile

Definir no build `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. São identificadores públicos, protegidos por RLS. Recompilar após mudar o ambiente.

`npm run export:web` gera SPA em `dist/`; a hospedagem deve servir `index.html` para rotas como `/account` e `/rooms`, usando HTTPS para microfone. A publicação em Sites será feita após a ativação do backend, com acesso privado inicialmente. Não há projeto Sites criado nem URL publicada nesta entrega.

Para telefone, vincular o projeto EAS e usar o perfil `preview`. iOS exige credenciais Apple e aparelho registrado para distribuição interna. Não houve build EAS nem teste físico nesta sessão.

## Teste de aceitação obrigatório antes de declarar pronto

Criar conta → receber código → confirmar → definir objetivo → fazer listening → gravar → enviar ao coach → receber correção → abrir revisão → salvar treino → sair → entrar em outro aparelho → conferir histórico. Repetir com um segundo usuário para isolamento. Testar também senha esquecida, áudio sem permissão, rede indisponível, limite diário e indisponibilidade OpenAI.
