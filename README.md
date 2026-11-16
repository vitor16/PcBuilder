# PcBuildBuddy

Site para montar um PC, comparar peças e revisar compatibilidade.

## Preços

O site não consulta preços ao vivo. Ele só mostra preços de um arquivo JSON verificado do KaBuM!; peças sem preço importado aparecem como indisponíveis, sem estimativa substituta.

Use **Download template** na seção de preços e preencha `checkedAt` e `prices`. Mantenha `"retailer": "KaBuM!"`; cada preço deve conter o ID da peça, o valor em BRL, `source: "KaBuM!"`, um URL de produto em `kabum.com.br` e a disponibilidade. Importe o arquivo para ver os preços e o total parcial ou completo.

Para validar o catálogo e os imports de preço:

```powershell
node tools/check-catalog.mjs
```
