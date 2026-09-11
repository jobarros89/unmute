# Produto e marcos

## Para quem

Adultos com rotina cheia que já tentaram estudar inglês, têm dificuldade de compreender fala natural e travam ao responder. O produto deve oferecer práticas curtas, contexto familiar e evidências honestas de evolução.

## Princípio pedagógico

Ouvir antes de ler; entender em contexto; repetir com apoio; adaptar a frase; receber feedback acionável; reencontrar dificuldades em sessões futuras. Gramática aparece para resolver uma dificuldade concreta.

O público inicial pode praticar situações de trabalho, família e viagem. Conteúdo de fé e comunidade pode ser uma trilha opcional futura. O produto não promete fluência em um prazo fixo.

## Marco 0 — fundação entregue neste PR

- Onboarding e três áreas do app.
- Nove frases em três contextos, com áudio do dispositivo.
- Gravar, ouvir e repetir; histórico local de treinos completos.
- Estrutura, testes, documentação e CI.

Critério técnico: instalar dependências pelo lockfile, validar os tipos, passar os testes e exportar bundles. Critério de dispositivo pendente: executar o roteiro de áudio em iPhone e Android reais.

## Marco 1 — primeiro ciclo com IA

1. Criar e configurar um projeto Supabase separado; login com e-mail/senha e recuperação de acesso.
2. Versionar o esquema mínimo; testar isolamento de dois usuários e acesso não autenticado.
3. Configurar a credencial Cloudflare Workers AI exclusivamente no backend.
4. Solicitar consentimento claro antes do primeiro envio de voz para análise.
5. Enviar tentativa curta, transcrever, mostrar a transcrição e lidar com trechos não compreendidos.
6. Oferecer uma correção específica e uma nova tentativa contextualizada.
7. Controlar uso antes da chamada externa e registrar custo sem registrar áudio/transcrição em logs.

Aceite: usuário novo entra, ouve, grava, recebe feedback real e encontra o resultado novamente após reabrir. Falhas de rede não perdem sua oportunidade de tentar novamente. Não declarar este marco concluído com respostas simuladas.

## Marco 2 — adaptação e retenção

Diagnóstico inicial separado por compreensão/fala, currículo progressivo, fila de revisão, dificuldades recorrentes e plano diário que realmente usa o tempo disponível. Comparação entre tentativas mediante consentimento de retenção do áudio.

Métricas: primeira prática concluída, retorno em 7 dias, conclusão de treinos, repetição após correção e custo por sessão. Métricas não devem incorporar conteúdo de voz ou identificar a pessoa sem necessidade.

## Marco 3 — piloto e distribuição

Development build no iPhone do fundador; APK de teste; piloto pequeno; medir qualidade de feedback e desistências. Acrescentar observabilidade com minimização de dados. Assinaturas entram após validação de valor e custo unitário.

## Fora do escopo inicial

Feed, ranking global, marketplace de professores, grupos, lives, biblioteca extensa de cursos, notificações de engajamento e integrações musicais. A prioridade é melhorar o ciclo de aprendizado.
