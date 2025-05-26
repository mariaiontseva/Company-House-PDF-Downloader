# Companies House PDF Downloader - PDF Branch

A web-based tool to download all PDF documents filed by UK companies from Companies House.

🌐 **[Live Demo](https://mariaiontseva.github.io/Company-House-PDF-Downloader/)**

## Features

- 🔍 Search for any UK company by name
- 📄 Download all PDF documents filed with Companies House
- 🚀 Works entirely in the browser (no server needed)
- 📦 Download individual files or all at once
- 🎨 Clean, modern UI with progress tracking

## How to Use

1. Visit the [live demo](https://mariaiontseva.github.io/Company-House-PDF-Downloader/)
2. Enter a company name (e.g., "Tesco PLC")
3. Enter your Companies House API key
4. Click "Search & Download PDFs"
5. Click individual download links or "Download All"

## Getting an API Key

1. Go to [Companies House Developer Hub](https://developer.company-information.service.gov.uk/get-started)
2. Create a free account
3. Register a new application
4. Copy your API key

## Deployment

### GitHub Pages

1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click Save
6. Your site will be available at `https://mariaiontseva.github.io/Company-House-PDF-Downloader/`

### Local Development

Simply open `index.html` in your browser:

```bash
open index.html
```

## Technical Details

- Pure JavaScript (no frameworks)
- Uses Companies House API
- Client-side only (no backend required)
- CORS handled via proxy service

## Limitations

- Rate limited by Companies House API (600 requests per 5 minutes)
- Large companies may have many documents
- Some older documents might not be available

## License

MIT License

## Contributing

Pull requests are welcome! Please feel free to submit a Pull Request.