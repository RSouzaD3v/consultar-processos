import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Neosimplify",
  description: "Generated by create next app",
};

const geist = Geist({ subsets: ['latin'] });

const localization = {
  signUp: {
    start: {
      title: 'Crie sua conta',
      subtitle: 'para continuar no {{applicationName}}',
      actionText: 'Já tem uma conta?',
      actionLink: 'Entrar',
    },
    emailLink: {
      title: 'Verifique seu e-mail',
      subtitle: 'para continuar no {{applicationName}}',
      formTitle: 'Link de verificação',
      formSubtitle: 'Use o link de verificação enviado para seu endereço de e-mail',
      resendButton: 'Não recebeu um link? Reenviar',
      verified: {
        title: 'Cadastro realizado com sucesso',
      },
      loading: {
        title: 'Cadastrando...',
      },
      verifiedSwitchTab: {
        title: 'E-mail verificado com sucesso',
        subtitle: 'Retorne à aba recém-aberta para continuar',
        subtitleNewTab: 'Retorne à aba anterior para continuar',
      },
    },
    // Outras traduções conforme necessário
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geist.className} antialiased`}
      >
        <ClerkProvider localization={localization}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
