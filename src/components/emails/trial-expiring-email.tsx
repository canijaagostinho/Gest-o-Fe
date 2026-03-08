import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TrialExpiringEmailProps {
  institutionName: string;
  daysLeft: number;
  isTrial: boolean;
  endDate: string;
}

export const TrialExpiringEmail = ({
  institutionName = "Gestor",
  daysLeft = 3,
  isTrial = true,
  endDate = "01/01/2026",
}: TrialExpiringEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Aviso Importante: O seu acesso ao Gestão Flex expira em breve.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Olá, {institutionName}</Heading>
        <Text style={text}>
          Faltam apenas <strong>{daysLeft} dias</strong> para o final{" "}
          {isTrial ? "do seu período de teste" : "da sua assinatura"}.
        </Text>
        <Text style={text}>
          Após o dia <strong>{endDate}</strong>, não poderá gerir os seus
          empréstimos e clientes, e o acesso será temporariamente suspenso até à
          renovação.
        </Text>
        <Text style={text}>
          Para garantir que não perde o acesso ao painel, faça o login agora
          mesmo e vá até <strong>Configurações &gt; Plano e Assinatura</strong>{" "}
          para escolher um plano mensal, trimestral, semestral ou anual.
        </Text>

        <Link href="https://seusite.com/settings/billing" style={button}>
          Renovar Assinatura
        </Link>

        <Text style={footer}>
          Se já efetuou o pagamento, pode ignorar esta mensagem. A nossa equipa
          irá atualizar o seu painel em breve.
          <br />
          Para qualquer dúvida, contacte suporte@gestaoflex.mz
        </Text>
      </Container>
    </Body>
  </Html>
);

export default TrialExpiringEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #f0f0f0",
  borderRadius: "12px",
  width: "480px",
  paddingLeft: "40px",
  paddingRight: "40px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#059669",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "14px 7px",
  fontWeight: "bold",
  marginTop: "24px",
  marginBottom: "24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "30px",
};
