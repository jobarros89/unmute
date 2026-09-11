# Estabilização do piloto

## Entregue nesta correção

- Áreas de treino exigem sessão; o link de confirmação e a sessão persistida são formas válidas de entrada. Minha conta explica o comportamento e permite sair.
- Player HTML com controles no navegador, download e salvamento explícito de até 20 gravações por conta no IndexedDB. Revisão em Meu progresso. Áudios não sincronizam entre aparelhos; limpar os dados do navegador pode removê-los. Esta persistência ainda é exclusiva da web.
- Fala web iniciada no clique, seleção de voz inglesa e velocidade 0,5×. Cancelamento ignora callbacks de falas anteriores.
- `npm run build` exige configuração pública do Supabase e verifica sua presença no bundle, evitando republicar a versão desativada por cache.

## Próximos critérios de liberação

1. Cadastro, confirmação, login, recuperação de senha e sessão encerrada testados em navegador e aparelho real. Recuperação por link ainda precisa de tratamento dedicado de PASSWORD_RECOVERY; usar código até essa etapa ser validada.
2. Primeira chamada autenticada ao coach, transcrição real e persistência da correção verificadas. Não usar tokens enviados em chat.
3. Medição de tokens, minutos de áudio, latência e erro por chamada; limite financeiro global além das 30 interações por usuário/dia.
4. Ambientes de homologação e produção, URL própria na conta do usuário, SMTP, backups e restauração ensaiada. Projetos e custos externos ainda não provisionados.
5. Vincular EAS, gerar APK e build iOS de teste, validar permissões e interrupções de áudio. Ainda não há distribuição nas lojas.
6. Expandir trilha curricular e revisão pedagógica, depois conversa contínua, análise acústica e notificações. Não apresentar correção textual como avaliação de pronúncia.

## Limites da validação desta entrega

Compilação e testes locais não comprovam reprodução audível, microfone físico, entrega de e-mail ou qualidade da Cloudflare. A sessão atual não dispõe de navegador automatizado com microfone para reproduzir o relato completo.
