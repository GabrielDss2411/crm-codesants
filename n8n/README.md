# n8n · WhatsApp ao concluir o diagnóstico

Envia uma mensagem no WhatsApp para o lead assim que ele termina de responder
o diagnóstico.

Importe [`diagnostico-whatsapp.json`](./diagnostico-whatsapp.json) no n8n
(*Workflows → ⋯ → Import from File*).

```
gatilho ──► Normalizar lead ──► Telefone válido? ──sim──► Enviar WhatsApp ──► Enviado
                                       │                        │
                                       └──não──► Telefone       └──erro──► Falhou o envio
                                                 inválido
```

---

## ⚠️ Leia isto antes: a primeira mensagem tem que ser um template

A API oficial do WhatsApp **não permite mensagem de texto livre** para quem não
te escreveu nas últimas 24 horas. O lead preencheu um formulário no site — ele
nunca abriu conversa com o seu número, então **não existe janela aberta**. Um
texto livre aqui volta com o erro `131047`.

Por isso o fluxo envia um **template aprovado**. Sem esse passo, nada funciona.

### O template a cadastrar

Em *Meta Business → WhatsApp Manager → Modelos de mensagem → Criar modelo*:

| Campo | Valor |
|---|---|
| Nome | `diagnostico_recebido` |
| Idioma | `Português (BR)` — código `pt_BR` |
| Categoria | **Utilidade** (é a confirmação de algo que a pessoa fez; aprova mais fácil e custa menos que Marketing) |

Corpo:

```
Olá, {{1}}! Recebi aqui o diagnóstico da {{2}} e já comecei a analisar com calma.

Em breve te retorno com as oportunidades que encontrei. Qualquer coisa, pode responder por aqui.

— Gabriel, CodeSants
```

Exemplos para a revisão da Meta: `{{1}}` = `Mariana`, `{{2}}` = `Alves Odontologia`.

O nome, o idioma e a **ordem das variáveis** são o contrato com o nó *Enviar
WhatsApp*. Mudou lá, mude aqui.

> A aprovação costuma sair em minutos, mas pode levar até 24h. Enquanto o
> template estiver pendente, o envio falha — e o fluxo responde
> `{"enviado": false, "motivo": "falha-no-envio"}` sem quebrar nada.

---

## Configuração no n8n

### 1. Credencial do token

*Credentials → New → Header Auth*:

| Campo | Valor |
|---|---|
| Name | `WhatsApp Cloud API` |
| Header Name | `Authorization` |
| Header Value | `Bearer SEU_TOKEN_PERMANENTE` |

Use o **token permanente** de um usuário do sistema, não o token de teste de 24h
do painel. Depois selecione essa credencial no nó *Enviar WhatsApp*.

### 2. Variável de ambiente

O nó monta a URL com o id do número remetente:

```
WHATSAPP_PHONE_NUMBER_ID=<Phone number ID do WhatsApp Manager>
```

Em n8n self-hosted, no `.env` da instância. No n8n Cloud, use *Variables* — ou
troque `{{ $env.WHATSAPP_PHONE_NUMBER_ID }}` pelo número direto na URL do nó.

### 3. Proteja o webhook

A URL do webhook é pública. No nó *Diagnóstico concluído*, em
*Authentication*, escolha **Header Auth** e crie uma credencial com um header
secreto (ex.: `X-Webhook-Token`). Depois configure o mesmo header no gatilho —
sem isso, qualquer pessoa que descobrir a URL dispara mensagens no seu número.

---

## Escolhendo o gatilho

O nó *Normalizar lead* aceita os dois formatos, então dá para trocar de gatilho
sem refazer o fluxo.

### Opção A — Database Webhook do Supabase (recomendada)

Nenhuma linha de código, nenhum deploy, e dispara no instante do `insert`.

*Supabase → Database → Webhooks → Create a new hook*:

| Campo | Valor |
|---|---|
| Table | `diagnosticos` |
| Events | `Insert` |
| Type | `HTTP Request` · `POST` |
| URL | a URL de produção do webhook do n8n |
| HTTP Headers | o header secreto do passo 3 |

O Supabase envia `{ type, table, record: { ... } }`, e o fluxo lê de
`body.record`.

### Opção B — o CRM chamando o n8n

Se preferir disparar do código, chame o webhook em
`app/api/diagnosticos/route.ts`, depois do `createDiagnostico`, enviando
`{ nome, empresa, telefone }` — o fluxo lê direto do `body`.

Se for por aí, **não use `await` sem cuidado**: a ingestão devolve o `id` que o
formulário precisa para anexar a disponibilidade, e segurar essa resposta
esperando o n8n atrasa a tela final do lead. Use `waitUntil` de
`@vercel/functions` para a chamada seguir em background.

---

## Testando

1. **Só o fluxo**, sem envolver o formulário:

   ```bash
   curl -X POST https://SEU-N8N/webhook/diagnostico-concluido \
     -H "Content-Type: application/json" \
     -d '{"nome":"Mariana Alves","empresa":"Alves Odontologia","telefone":"(11) 98812-4409"}'
   ```

   Use um número **seu** para o primeiro teste.

2. **Ponta a ponta**: preencha o diagnóstico em
   <https://forms.codesants.com.br> e veja a execução aparecer no n8n.

O que esperar de resposta:

| Resposta | Significado |
|---|---|
| `{"enviado": true, ...}` | Mensagem aceita pela Meta (`whatsappId` é o id dela) |
| `{"enviado": false, "motivo": "telefone-invalido"}` | Não chegou a 12–13 dígitos com o `55` |
| `{"enviado": false, "motivo": "falha-no-envio"}` | A Meta recusou — veja o `detalhe` e a execução no n8n |

Os três respondem **200** de propósito: uma falha no WhatsApp não pode fazer o
registro do lead parecer que deu erro.

---

## Detalhes de implementação

- **Telefone em E.164 sem `+`**, que é o formato da Graph API. O nó trata
  entrada com máscara, com `+55`, com `0` na frente e sem o nono dígito.
  Valida por tamanho: `55` + DDD + 8 ou 9 dígitos.
- **Primeiro nome** na saudação: "Olá, Mariana" soa melhor que o nome completo.
  Sem nome, cai para "Olá, tudo bem"; sem empresa, para "sua empresa".
- **3 tentativas** com 2s de espera no envio, porque a Graph API tem falhas
  transitórias.
- **Erro não interrompe**: o nó de envio usa saída de erro em vez de derrubar
  a execução.

### Usando Evolution API, Z-API ou similar

Troque **apenas** o nó *Enviar WhatsApp*: URL do seu provedor e corpo em texto
livre (`{"number": "={{ $json.telefone }}", "text": "Olá, ..."}`). Todo o resto
do fluxo continua igual, e a exigência de template deixa de existir.

Em troca, some a garantia: são APIs não oficiais que operam sobre o WhatsApp
Web, e o número pode ser bloqueado pela Meta. Para a primeira mensagem a um
lead que acabou de deixar os dados, a via oficial é a que não te deixa na mão.

---

## O que este fluxo não faz

- **Não avisa você.** Só o lead recebe. Para receber uma cópia, duplique o nó
  de envio apontando para o seu número (com template próprio) ou adicione um
  nó de e-mail/Telegram em paralelo.
- **Não trata a disponibilidade.** O lead informa dias e horários *depois* do
  `insert`, num `PATCH`. Para reagir a isso, crie um segundo hook no Supabase
  com evento `Update`.
