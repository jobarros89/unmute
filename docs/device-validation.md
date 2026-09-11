# Distribuição e validação no aparelho

O app web está publicado em https://unmute-english-josue.jobarros.chatgpt.site.
Isso não é uma publicação iOS/Android. Não existe build EAS instalável nesta entrega.

## Publicação de teste pelo Expo EAS

Usar o perfil `preview`: ele produz um app com JavaScript embutido, sem depender de um servidor Metro ligado. Android gera APK; iOS usa distribuição interna com assinatura Apple e aparelho registrado.

Em um terminal autenticado na conta Expo do proprietário:

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli device:create
npx eas-cli build --platform ios --profile preview
# Para Android:
npx eas-cli build --platform android --profile preview
```

Não criar outro projeto Supabase. O perfil preview usa o backend atual, inclusive sua cota de IA; ainda não há isolamento de homologação. As variáveis no perfil são públicas. Nunca inserir token Cloudflare ou service_role no cliente.

`eas init` deve registrar o projectId real retornado pelo serviço e o proprietário em app.json. Não inventar esses valores. Para iPhone, a conta Apple Developer precisa permitir assinatura e o aparelho precisa constar no provisionamento. Não compartilhar senhas ou tokens pelo chat.

O perfil `development` antigo requer instalar expo-dev-client compatível antes de ser usado. A distribuição `preview` não depende dele.

## Critérios de aceite — ainda não executados em aparelho físico

Registrar versão/build, aparelho, sistema, resultado esperado, resultado observado e evidência sem credenciais. Um bundle exportado ou teste simulado não aprova estas etapas.

| Fluxo       | Evidência necessária                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Cadastro    | Conta nova recebe e-mail; código confirma; login com senha funciona                                       |
| Login       | Senha errada rejeitada; saída impede abrir rotas protegidas; sessão correta após reabrir                  |
| Recuperação | Senha antiga deixa de funcionar e nova funciona; validar código e link separadamente                      |
| Gravação    | Permitir e negar microfone; gravar, ouvir inteiro, repetir e interromper; não perder áudio antes do envio |
| Velocidade  | Mesma frase em normal e 0,5×, diferença audível no aparelho                                               |
| Revisão web | Salvar, recarregar e ouvir; excluir só após confirmação; outra conta não vê o áudio                       |
| Coach       | Enviar áudio real; conferir transcrição, resposta e correção remota, latência e tratamento de erro        |
| Rede        | Sem conexão não informar salvamento remoto ou análise bem-sucedidos                                       |

Bloqueadores conhecidos: revisão permanente de áudio ainda só na web; callback nativo de confirmação/recuperação e recuperação web por link precisam de implementação/validação; nenhum teste de entrega de e-mail ou primeira conversa real foi concluído aqui. Não promover para lojas enquanto esses fluxos não passarem.

Referência: https://docs.expo.dev/build/internal-distribution/
