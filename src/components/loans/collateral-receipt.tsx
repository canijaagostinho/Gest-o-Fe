import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

// Register fonts if needed, or use default
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#112233",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "grey",
  },
  signatureBlock: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 200,
    textAlign: "center",
    paddingTop: 5,
    fontSize: 10,
  },
});

interface CollateralReceiptProps {
  institutionName: string;
  clientName: string;
  loanId: string;
  collateralType: string;
  collateralDescription: string;
  collateralValue: number;
  collateralLocation?: string;
  date: string;
}

export const CollateralReceipt = ({
  institutionName,
  clientName,
  loanId,
  collateralType,
  collateralDescription,
  collateralValue,
  collateralLocation,
  date,
}: CollateralReceiptProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{institutionName}</Text>
        <Text style={styles.subtitle}>Comprovante de Registro de Garantia</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 15, fontWeight: "bold" }}>
          Dados do Empréstimo
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>ID do Contrato:</Text>
          <Text style={styles.value}>{loanId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{clientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Registro:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <Text
          style={{
            fontSize: 14,
            marginTop: 20,
            marginBottom: 15,
            fontWeight: "bold",
          }}
        >
          Detalhes da Garantia
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de Bem:</Text>
          <Text style={styles.value}>
            {collateralType === "vehicle"
              ? "Veículo"
              : collateralType === "real_estate"
                ? "Imóvel"
                : "Outros"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Descrição:</Text>
          <Text style={styles.value}>{collateralDescription}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Estimado:</Text>
          <Text style={styles.value}>{formatCurrency(collateralValue)}</Text>
        </View>
        {collateralLocation && (
          <View style={styles.row}>
            <Text style={styles.label}>Localização:</Text>
            <Text style={styles.value}>{collateralLocation}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 10, textAlign: "justify", marginTop: 20 }}>
          Declaro que entreguei/registrei o bem acima descrito como garantia do
          empréstimo contraído, estando ciente de que o mesmo poderá ser
          executado em caso de inadimplência, conforme os termos do contrato.
        </Text>
      </View>

      <View style={styles.signatureBlock}>
        <View style={styles.signature}>
          <Text>Assinatura do Cliente</Text>
        </View>
        <View style={styles.signature}>
          <Text>Assinatura do Agente/Instituição</Text>
        </View>
      </View>


    </Page>
  </Document>
);
