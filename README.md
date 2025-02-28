# Ethereum Sepolia Faucet

A free-to-use Ethereum Sepolia testnet faucet application that allows developers to request test ETH for development and testing purposes.

feel free to donate <3 - `0x8006C2663a286076e190152c38002CB371976138`

## Features

- **Simple Interface**: Clean, user-friendly interface for requesting test ETH
- **Password Protection**: Secure access control to prevent abuse
- **Transaction Tracking**: View transaction status and Etherscan links
- **Configurable**: Easily adjust ETH amount, RPC endpoints, and more
- **Error Handling**: Comprehensive error handling for network issues and transaction failures
- **Responsive Design**: Works on desktop and mobile devices
- **Timeout Resistant**: Two-phase transaction approach to prevent 504 Gateway Timeout errors

## Getting Started

### Prerequisites

- Node.js 18.x or later
- An Ethereum wallet with Sepolia ETH (to fund the faucet)
- Sepolia RPC endpoint (from providers like Alchemy, Infura, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ethereum-sepolia-faucet.git
cd ethereum-sepolia-faucet
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file based on the example:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```
# Your faucet wallet's private key (without 0x prefix)
FAUCET_PRIVATE_KEY=your_private_key_here

# Maximum amount of ETH to send per request
NEXT_PUBLIC_MAX_ETH_AMOUNT=0.05

# Sepolia RPC URL (e.g. from Alchemy, Infura, etc.)
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url_here

# Faucet Password - Required for access control
NEXT_PUBLIC_FAUCET_PASSWORD=your_password_here

# Optional: Set the cooldown period between requests from the same address (in minutes)
NEXT_PUBLIC_COOLDOWN_MINUTES=1440
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Deploy on Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy

### Other Hosting Options

You can also deploy this application on any hosting platform that supports Next.js applications:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Security Considerations

- **Private Key**: Never expose your faucet wallet's private key. Use environment variables and keep your `.env.local` file secure.
- **Password Protection**: Change the default password to prevent unauthorized access.
- **Rate Limiting**: Consider implementing additional rate limiting to prevent abuse.
- **Funding**: Regularly monitor the faucet wallet balance and refill as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Ethereum interactions via [Viem](https://viem.sh/)

## Technical Details

### Handling Long-Running Transactions

This faucet uses a two-phase transaction approach to prevent 504 Gateway Timeout errors:

1. **Phase 1**: The API submits the transaction to the blockchain and immediately returns the transaction hash
2. **Phase 2**: The client polls a separate endpoint to check the transaction status

This approach ensures that the initial API request completes quickly, avoiding timeouts on hosting platforms with strict time limits (like Vercel).

### Error Handling

The application includes robust error handling for various scenarios:

- Network connectivity issues
- JSON parsing errors
- Transaction failures
- RPC endpoint timeouts
- Gateway timeouts

---

Created with ❤️ for the Ethereum developer community
