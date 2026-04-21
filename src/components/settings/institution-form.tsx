"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Building2,
  Palette,
  FileBadge,
  MapPin,
  Users,
  Upload,
  Save,
  Check,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { MOZAMBIQUE_LOCATIONS } from "@/lib/mozambique-locations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Schemas & Types ---

const institutionTypeEnum = [
  "Cooperativa",
  "ONG",
  "Microfinanceira",
  "Instituição Financeira",
  "Projeto Social",
  "Grupo Comunitário",
  "Associação",
  "Fundação",
  "Empresa Privada",
  "Sociedade Comercial",
  "Pessoa Particular",
  "Credor Individual",
  "Investidor Independente",
  "Prestador de Serviços Financeiros",
  "Outro",
] as const;

const formSchema = z.object({
  // 1. General
  name: z.string().min(2, "Nome é obrigatório"),
  trade_name: z.string().optional(),
  acronym: z.string().optional(),
  type: z.enum(institutionTypeEnum),
  type_other_desc: z.string().optional(),
  foundation_date: z.string().optional(),
  number_of_employees: z.coerce.number().min(0).default(0),

  // 2. Visual
  logo_url: z.string().optional(), // Mock upload for now
  stamp_url: z.string().optional(),
  primary_color: z.string().min(4).regex(/^#/, "Cor inválida"),
  secondary_color: z.string().min(4).regex(/^#/, "Cor inválida"),

  // 3. Legal
  nuit: z.string().min(9, "NUIT deve ter 9 dígitos").max(9),
  reg_number: z.string().optional(),
  tax_regime: z.string().optional(),

  // 4. Address
  country: z.literal("Moçambique"),
  province: z.string().min(1, "Selecione a província"),
  district: z.string().min(1, "Selecione o distrito"), // Changed from 'city' to 'district' per Moz structure
  neighborhood: z.string().optional(),
  address_line: z.string().min(5, "Endereço obrigatório"),
  phone: z.string().min(9, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  website: z.string().url().optional().or(z.literal("")),

  // 5. Responsible
  responsible_name: z.string().min(2, "Nome do responsável obrigatório"),
  responsible_role: z.string().min(2, "Cargo obrigatório"),
  responsible_phone: z.string().optional(),
  responsible_email: z.string().email().optional().or(z.literal("")),
});

type InstitutionFormValues = z.infer<typeof formSchema>;
import { RoleName } from "@/types";

export function InstitutionForm() {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  // Mock preview states
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewPrimary, setPreviewPrimary] = useState("#2563EB");

  // Derived state for districts
  const [districts, setDistricts] = useState<string[]>([]);

  const supabase = createClient();

  const form = useForm<InstitutionFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      trade_name: "",
      acronym: "",
      type: "Microfinanceira",
      type_other_desc: "",
      foundation_date: "",
      logo_url: "",
      stamp_url: "",
      primary_color: "#2563EB",
      secondary_color: "#10B981",
      nuit: "",
      reg_number: "",
      tax_regime: "",
      country: "Moçambique",
      province: "",
      district: "",
      neighborhood: "",
      address_line: "",
      phone: "",
      email: "",
      website: "",
      responsible_name: "",
      responsible_role: "",
      responsible_phone: "",
      responsible_email: "",
      number_of_employees: 0,
    },
  });

  // Watchers for dynamic logic
  const selectedProvince = form.watch("province");
  const watchedPrimaryColor = form.watch("primary_color");
  const watchedType = form.watch("type");

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const provData = MOZAMBIQUE_LOCATIONS.find(
        (p) => p.name === selectedProvince,
      );
      setDistricts(provData ? provData.districts : []);
      // Reset district if not in new list
      const currentDistrict = form.getValues("district");
      if (provData && !provData.districts.includes(currentDistrict)) {
        form.setValue("district", "");
      }
    }
  }, [selectedProvince, form]);

  // Update preview color
  useEffect(() => {
    if (watchedPrimaryColor) setPreviewPrimary(watchedPrimaryColor);
  }, [watchedPrimaryColor]);

  // Initial Fetch (Role & Data)
  useEffect(() => {
    async function init() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user role and institution_id
        const { data: profile } = await supabase
          .from("users")
          .select("institution_id, role:roles(name)")
          .eq("id", user.id)
          .single();

        const role = (profile?.role as unknown as { name: RoleName })?.name;
        setUserRole(role);

        const targetInstitutionId = profile?.institution_id;
        if (targetInstitutionId) {
          const { data: inst } = await supabase
            .from("institutions")
            .select("*")
            .eq("id", targetInstitutionId)
            .single();

          if (inst) {
            form.reset({
              name: inst.name || "",
              trade_name: inst.trade_name || "",
              acronym: inst.acronym || "",
              type: (inst.type as typeof institutionTypeEnum[number]) || "Microfinanceira",
              type_other_desc: inst.type_other_desc || "",
              foundation_date: inst.foundation_date || "",
              number_of_employees: inst.number_of_employees || 0,
              logo_url: inst.logo_url || "",
              stamp_url: inst.stamp_url || "",
              primary_color: inst.primary_color || "#2563EB",
              secondary_color: inst.secondary_color || "#10B981",
              nuit: inst.nuit || "",
              reg_number: inst.reg_number || "",
              tax_regime: inst.tax_regime || "",
              country: "Moçambique",
              province: inst.province || "",
              district: inst.district || "",
              neighborhood: inst.neighborhood || "",
              address_line: inst.address_line || "",
              phone: inst.phone || "",
              email: inst.email || "",
              website: inst.website || "",
              responsible_name: inst.responsible_name || "",
              responsible_role: inst.responsible_role || "",
              responsible_phone: inst.responsible_phone || "",
              responsible_email: inst.responsible_email || "",
            });
            if (inst.logo_url) setPreviewLogo(inst.logo_url);
            if (inst.primary_color) setPreviewPrimary(inst.primary_color);
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [supabase, form]);

  const onSubmit = async (values: InstitutionFormValues) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();

      if (!profile?.institution_id)
        throw new Error("Instituição não encontrada");

      const { error } = await supabase
        .from("institutions")
        .update({
          ...values,
          // Supabase will handle the filtering by ID via RLS or explicit ID
        })
        .eq("id", profile.institution_id);

      if (error) throw error;

      toast.success("Perfil institucional atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 2MB");
      return;
    }

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${userRole}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("institution-logos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("institution-logos").getPublicUrl(filePath);

      // Update Form & Preview
      form.setValue("logo_url", publicUrl);
      setPreviewLogo(publicUrl);
      toast.success("Logo carregado com sucesso!");
    } catch (error: any) {
      console.error("Upload error details:", error);
      toast.error(`Erro: ${error.message || "Falha no upload"}`, {
        description: "Verifique o console para mais detalhes.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left: Navigation Tabs */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-none shadow-sm sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Navegação</CardTitle>
            <CardDescription>Seções do perfil.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1">
            {[
              { id: "general", label: "Informações Gerais", icon: Building2 },
              { id: "visual", label: "Identidade Visual", icon: Palette },
              { id: "legal", label: "Dados Fiscais", icon: FileBadge },
              { id: "address", label: "Endereço e Contato", icon: MapPin },
              { id: "responsible", label: "Responsáveis", icon: Users },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`justify-start w-full ${activeTab === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600"}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Live Preview Card (Mini) */}
        <Card className="border-none shadow-sm sticky top-[300px] overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: previewPrimary }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
              {previewLogo ? (
                <Image
                  src={previewLogo}
                  alt="Pré-visualização do Logotipo da Instituição"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">LOGO</span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {form.watch("name") || "Nome da Instituição"}
              </p>
              <p className="text-xs text-slate-500">{form.watch("type")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Form Content */}
      <div className="lg:col-span-3">
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Editar Perfil
                </CardTitle>
                <CardDescription>
                  Mantenha os dados da sua instituição atualizados.
                </CardDescription>
              </div>
              {userRole === "admin_geral" || userRole === "gestor" ? (
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Alterações
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 py-1.5 px-3"
                >
                  <ShieldAlert className="w-3 h-3 mr-2" />
                  Modo Visualização
                </Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-8">
            <Form {...form}>
              <form className="space-y-8">
                {/* 1. GENERAL */}
                <div
                  className={
                    activeTab === "general" ? "block space-y-6" : "hidden"
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>
                            Nome da Instituição{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: MicroCrédito Futuro"
                              disabled={
                                userRole !== "admin_geral" &&
                                userRole !== "gestor"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trade_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Comercial (Fantasia)</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="acronym"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sigla</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: MCF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Instituição</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {institutionTypeEnum.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchedType === "Outro" && (
                      <FormField
                        control={form.control}
                        name="type_other_desc"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Descrição do Tipo</FormLabel>
                            <FormControl>
                              <Input placeholder="Especifique..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="foundation_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fundação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number_of_employees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Funcionários</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 2. VISUAL */}
                <div
                  className={
                    activeTab === "visual" ? "block space-y-6" : "hidden"
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <FormLabel>Logotipo Institucional</FormLabel>
                      <label
                        htmlFor="logo-upload"
                        className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-center relative"
                      >
                        <div className="bg-blue-50 p-3 rounded-full mb-3">
                          <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          Clique para selecionar imagem
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          PNG, SVG ou JPG (Max 2MB)
                        </p>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={
                            loading ||
                            (userRole !== "admin_geral" &&
                              userRole !== "gestor")
                          }
                        />
                      </label>
                    </div>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="primary_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Primária</FormLabel>
                            <div className="flex gap-3">
                              <Input
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                {...field}
                              />
                              <Input
                                {...field}
                                placeholder="#HEX"
                                className="uppercase"
                              />
                            </div>
                            <FormDescription>
                              Usada em botões e destaques.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondary_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Secundária</FormLabel>
                            <div className="flex gap-3">
                              <Input
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                {...field}
                              />
                              <Input
                                {...field}
                                placeholder="#HEX"
                                className="uppercase"
                              />
                            </div>
                            <FormDescription>
                              Usada em detalhes e bordas.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. LEGAL */}
                <div
                  className={
                    activeTab === "legal" ? "block space-y-6" : "hidden"
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nuit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            NUIT / NIF <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123456789"
                              maxLength={9}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reg_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Registro Legal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Registro comercial ou BR"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax_regime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regime Fiscal</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: ISPC, IRPC..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 4. ADDRESS */}
                <div
                  className={
                    activeTab === "address" ? "block space-y-6" : "hidden"
                  }
                >
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                    <p className="text-sm text-slate-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      Certifique-se de que a localização corresponde ao endereço
                      fiscal.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Província <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MOZAMBIQUE_LOCATIONS.map((prov) => (
                                  <SelectItem key={prov.name} value={prov.name}>
                                    {prov.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Distrito / Cidade{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!selectedProvince}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      selectedProvince
                                        ? "Selecione o distrito"
                                        : "Selecione a província primeiro"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districts.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Polana Cimento"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="address_line"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Endereço Físico Completo{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Av. Salvador Allende, Nº 123, 2º Andar"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Institucional</FormLabel>
                          <FormControl>
                            <Input placeholder="+258 8..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Institucional</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="contato@empresa.co.mz"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 5. RESPONSIBE */}
                <div
                  className={
                    activeTab === "responsible" ? "block space-y-6" : "hidden"
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="responsible_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nome do Responsável Legal{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="responsible_role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Cargo / Função{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Diretor Geral" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="responsible_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Direto</FormLabel>
                          <FormControl>
                            <Input placeholder="+258..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="responsible_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Direto</FormLabel>
                          <FormControl>
                            <Input placeholder="email@..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
