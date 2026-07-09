"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanyResearchInputSchema, type CompanyResearchInput } from "@/lib/validation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyResearchInput>({
    resolver: zodResolver(CompanyResearchInputSchema),
    defaultValues: {
      companyName: "",
      ticker: "",
    },
  });

  const onSubmit = (data: CompanyResearchInput) => {
    // Navigate to the research route configured in architecture
    router.push(`/research/${encodeURIComponent(data.companyName)}${data.ticker ? `?ticker=${encodeURIComponent(data.ticker)}` : ""}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Aegis AI</CardTitle>
          <CardDescription className="text-center">
            Evidence-First Investment Research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
              <Input
                id="companyName"
                placeholder="e.g. Apple Inc."
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol (Optional)</Label>
              <Input
                id="ticker"
                placeholder="e.g. AAPL"
                {...register("ticker")}
              />
              {errors.ticker && (
                <p className="text-sm text-red-500">{errors.ticker.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Initializing..." : "Start Research"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
