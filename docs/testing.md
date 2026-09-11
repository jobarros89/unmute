# Validação

## Evidência da fundação — 11/09/2026

- TypeScript e seis testes de domínio passaram localmente.
- Verificação de fronteira de segredos e formatação passaram.
- Bundles para web, iOS e Android exportados com sucesso.
- Fluxo de navegador validado em viewport 390 × 844: onboarding, recomendação por objetivo, três gravações, reprodução, conclusão única, persistência após recarregar e recuperação de rota inválida. Sem erros de JavaScript capturados.
- O navegador usou microfone sintético do Chromium. Reprodução de voz sintetizada do sistema e qualidade acústica não foram avaliadas. Não houve teste em dispositivo físico, chamada de IA ou acesso a banco remoto.

## Automática

`npm run check`: TypeScript, testes de domínio e fronteira de segredos do mobile.

`npm run export:web`: bundle da visualização web.

`npm run export:native`: bundles JavaScript e assets para iOS/Android. Não compila binários nativos, não cria distribuição e não testa hardware.

Os testes de domínio verificam duplicidade de conclusão, dados inválidos, instalação nova, duração válida, preferências e retenção. A CI usa apenas permissões de leitura e não precisa de credenciais de serviços.

## Roteiro no aparelho — obrigatório antes do piloto

| Teste                               | Resultado esperado                                                       |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Instalação nova                     | Onboarding sem dados ou pontuações inventadas                            |
| Definir objetivo e ritmo            | Home recomenda o contexto escolhido; preferências sobrevivem ao reinício |
| Ouvir normalmente e devagar         | Voz inglesa reproduz a frase; tradução só aparece ao revelar             |
| Negar microfone                     | Explicação clara; app não conclui uma tentativa inexistente              |
| Gravar e parar                      | É possível ouvir a própria voz                                           |
| Gravar novamente                    | A nova tentativa substitui a anterior                                    |
| Gravar até o limite                 | Gravação para em até 30 segundos                                         |
| Trocar de app ou sair do treino     | Gravação e reprodução param; sessão incompleta não vira conclusão        |
| Concluir três frases                | Histórico recebe exatamente uma sessão e três repetições                 |
| Reabrir aplicativo                  | Histórico e objetivo persistem                                           |
| Falhar ao salvar                    | Mensagem de erro, possibilidade de repetir sem inflar histórico          |
| Link de treino inexistente          | Tela de recuperação com navegação de volta                               |
| Fonte ampliada e VoiceOver/TalkBack | Botões legíveis, acionáveis e sem corte de conteúdo                      |

Testar pelo menos um iPhone e um Android. Em web, executar em localhost/HTTPS e avaliar suporte a voz e microfone. Automação de navegador com mídia simulada valida fluxo e persistência; não substitui QA acústico ou validação nativa.

## Pendências conhecidas da fundação

- Não há autenticação, sincronização ou recuperação remota de histórico.
- O treino abandonado não é retomado do ponto anterior.
- Só a gravação aceita de cada frase entra no tempo contabilizado.
- Encerramento abrupto pode deixar um arquivo temporário no cache do sistema.
- Não há build EAS, validação em dispositivo físico, IA ativa ou banco provisionado.

## Incremento autenticado

`tests/database.test.ts` aplica a migration no PostgreSQL embutido PGlite, cria papéis isolados e verifica: negação de leitura cruzada; negação de escrita de respostas IA pelo cliente; negação de execução das RPCs pelo cliente; revisão criada atomicamente; campo de correção imutável pelo cliente; cota de 30 pedidos e idempotência. A função auth.uid() é simulada por claim de sessão de teste. Isso não cobre o gateway HTTP, Auth real nem entrega de e-mail.

`tests/plan.test.ts` cobre orçamento diário e dias consecutivos com datas locais. `deno check` valida a Edge Function. Testes ao vivo com Supabase, OpenAI, navegador e microfone em aparelho ainda não foram executados nesta entrega. O roteiro completo está em docs/deployment.md.
