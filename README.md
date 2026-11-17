# PcBuildBuddy

Site para montar um PC, comparar peças e revisar compatibilidade.

## Preços

Os valores marcados com `~` são estimativas de planejamento em reais, não ofertas ao vivo nem cotações confirmadas por loja; podem ficar desatualizados e variar por modelo, vendedor, frete e forma de pagamento. Itens gratuitos, incluídos ou apenas visuais podem custar R$ 0.

Para substituir estimativas por cotações verificadas do KaBuM!, use **Download template** na seção de preços e preencha `checkedAt` e `prices`. Mantenha `"retailer": "KaBuM!"`; cada preço deve conter o ID da peça, o valor em BRL, `source: "KaBuM!"`, um URL de produto em `kabum.com.br` e a disponibilidade. Importe o arquivo para substituir as estimativas dos itens listados.

Para validar o catálogo e os imports de preço:

```powershell
node tools/check-catalog.mjs
```
