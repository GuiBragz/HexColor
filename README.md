# HexColor 🎨

Uma ferramenta avançada de seleção, exploração e gerenciamento de cores para desenvolvedores Front-end e UI/UX Designers. O projeto foi construído **100% com Vanilla JavaScript, HTML5 e CSS3**, sem o uso de frameworks, focado em alta performance e manipulação direta do DOM e da Canvas API.

![HexColor logo](./logohex.png)

## 🚀 Funcionalidades

* **Seletor de Cores Avançado:** Color picker customizado construído com a `Canvas API` simulando ferramentas de design profissionais.
* **Captura de Tela (EyeDropper):** Integração com a `EyeDropper API` nativa dos navegadores para capturar cores de qualquer lugar do seu monitor.
* **Extração via Imagem:** Faça upload de imagens e clique em qualquer pixel para extrair a cor exata em HEX, RGB ou Variável CSS.
* **Escalas e Harmonias:** Geração matemática em tempo real de *Tints* (tons claros), *Shades* (tons escuros) e paletas harmônicas (complementares, análogas, triádicas).
* **Acessibilidade (APCA):** Validação de contraste de texto e fundo utilizando o moderno algoritmo APCA (preparado para a futura WCAG 3.0).
* **UI Theme Builder:** Preview em tempo real de como a sua cor selecionada se comporta em componentes de interface (Navbars, Botões, Cards).
* **Exportação Profissional:** Exporte seu histórico de cores com um clique para `CSS Variables` (:root) ou formato JSON para o `tailwind.config.js`.

## 🛠️ Tecnologias Utilizadas

* **HTML5** (Semântica e estrutura)
* **CSS3** (Variáveis CSS, Flexbox, Grid, Dark Mode)
* **JavaScript (ES6+)** (Vanilla JS, lógica matemática de cores)
* **Canvas API** (Renderização do espectro de cores e imagens)
* **Web APIs** (`EyeDropper`, `Clipboard API`, `FileReader`)
* **LocalStorage** (Persistência do histórico de cores)

## 📂 Estrutura do Projeto

```text
/
├── index.html       # Estrutura principal da aplicação
├── style.css        # Estilização completa (Dark Mode default)
├── script.js        # Lógica da aplicação e manipulação do Canvas
├── logohex.png      # Logo do projeto
└── favicon.png      # Ícone do navegador
```

## ⚙️ Como Executar

Por ser um projeto puramente estático (Vanilla), você não precisa de Node.js, NPM ou processos de build.

1. Clone este repositório:
   ```bash
   git clone [https://github.com/seu-usuario/hexcolor.git](https://github.com/seu-usuario/hexcolor.git)
   ```
2. Entre na pasta do projeto:
   ```bash
   cd hexcolor
   ```
3. Abra o arquivo `index.html` diretamente no seu navegador ou utilize a extensão **Live Server** no VS Code (recomendado para evitar bloqueios de CORS ao ler imagens locais no Canvas).

## ⌨️ Atalhos de Teclado

* `C` - Copia o código HEX da cor atual para a área de transferência.
* `R` - Gera uma cor aleatória.

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar, modificar e distribuir.
