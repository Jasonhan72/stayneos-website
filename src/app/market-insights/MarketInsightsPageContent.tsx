"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  ArrowRight,
  Loader2,
  BarChart3,
  PieChart,
  LineChart,
  Building2,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  Eye,
  FileText,
  Mail,
  Phone
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Form validation schema
const reportFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  reportType: z.enum(["quarterly", "annual", "custom"]).optional(),
  interests: z.array(z.string()).optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export default function MarketInsightsPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const formData = { ...data, interests: selectedInterests };
      console.log("Form data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const marketStats = [
    {
      title: "Average Rental Rate",
      value: "$3,247",
      change: "+8.3%",
      trend: "up",
      description: "Monthly rent for 1BR executive apartments",
      icon: DollarSign
    },
    {
      title: "Occupancy Rate",
      value: "94.7%",
      change: "+2.1%", 
      trend: "up",
      description: "Average occupancy across premium properties",
      icon: Building2
    },
    {
      title: "Market Growth",
      value: "12.4%",
      change: "+1.8%",
      trend: "up",
      description: "Year-over-year demand increase",
      icon: TrendingUp
    },
    {
      title: "Supply Shortage",
      value: "23%",
      change: "-5.2%",
      trend: "down",
      description: "Below optimal inventory levels",
      icon: AlertTriangle
    }
  ];

  const keyInsights = [
    {
      title: "Executive Housing Demand Surges",
      description: "Corporate housing demand has increased by 15.3% year-over-year, driven by hybrid work policies and business travel recovery.",
      impact: "High",
      trend: "up"
    },
    {
      title: "Supply Constraints Drive Prices",
      description: "Limited supply of premium furnished apartments has created upward pressure on rental rates, particularly in downtown core.",
      impact: "High", 
      trend: "up"
    },
    {
      title: "Length of Stay Extending",
      description: "Average stay duration has increased to 4.2 months, up from 2.8 months pre-pandemic, indicating shifting work patterns.",
      impact: "Medium",
      trend: "up"
    },
    {
      title: "Technology Sector Leading Demand",
      description: "Tech companies account for 34% of corporate housing bookings, followed by financial services at 28%.",
      impact: "Medium",
      trend: "stable"
    }
  ];

  const neighborhoodData = [
    { name: "Downtown Core", avgRate: 3850, occupancy: 96.2, growth: 9.1 },
    { name: "Yorkville", avgRate: 4200, occupancy: 94.8, growth: 12.3 },
    { name: "Liberty Village", avgRate: 3100, occupancy: 93.5, growth: 7.8 },
    { name: "Midtown", avgRate: 2800, occupancy: 95.1, growth: 6.4 },
    { name: "North York", avgRate: 2400, occupancy: 91.7, growth: 5.2 },
    { name: "Waterfront", avgRate: 3650, occupancy: 97.3, growth: 14.7 }
  ];

  const marketForecasts = [
    {
      period: "Q4 2024",
      prediction: "Continued strength in executive housing demand with seasonal uptick in corporate relocations.",
      confidence: "High",
      keyFactors: ["Holiday corporate events", "Year-end relocations", "Budget cycle renewals"]
    },
    {
      period: "Q1 2025",
      prediction: "Moderate growth as new supply enters market, potentially stabilizing rental rate increases.",
      confidence: "Medium",
      keyFactors: ["New development completions", "Return-to-office policies", "Economic conditions"]
    },
    {
      period: "2025 Full Year",
      prediction: "Sustained demand growth of 8-12% with increased focus on premium amenities and flexible terms.",
      confidence: "Medium",
      keyFactors: ["Hybrid work normalization", "Corporate travel recovery", "Supply-demand balance"]
    }
  ];

  const reportTypes = [
    {
      type: "quarterly",
      title: "Quarterly Market Report",
      description: "Latest quarterly trends, pricing data, and short-term forecasts",
      features: ["Current quarter analysis", "Pricing trends", "Occupancy data", "90-day forecast"]
    },
    {
      type: "annual", 
      title: "Annual Market Analysis",
      description: "Comprehensive yearly overview with detailed forecasts and trend analysis",
      features: ["Full year analysis", "Long-term forecasts", "Industry benchmarks", "Strategic insights"]
    },
    {
      type: "custom",
      title: "Custom Market Research", 
      description: "Tailored analysis focused on your specific market interests and business needs",
      features: ["Customized data", "Specific focus areas", "Executive briefing", "Direct analyst access"]
    }
  ];

  const interestOptions = [
    "Rental Rate Trends",
    "Occupancy Analytics", 
    "Neighborhood Analysis",
    "Corporate Demand Patterns",
    "Supply & Development",
    "Competitive Landscape",
    "Regulatory Changes",
    "Investment Opportunities"
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("marketInsights.hero.title", "Toronto Real Estate Market Insights")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("marketInsights.hero.subtitle", "Comprehensive market analysis and trends for Toronto's executive housing market. Data-driven insights to inform your investment and housing decisions.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                {t("marketInsights.hero.downloadCta", "Download Report")}
              </button>
              <button 
                onClick={() => document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200"
              >
                {t("marketInsights.hero.viewCta", "View Insights")}
              </button>
            </div>
          </div>
        </Container>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </Section>

      {/* Market Statistics */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("marketInsights.stats.title", "Key Market Metrics")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("marketInsights.stats.subtitle", "Latest data from Toronto's premium executive housing market as of Q3 2024.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketStats.map((stat, index) => (
              <div key={index} className="bg-white p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mx-auto mb-6">
                  <stat.icon size={32} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className={`flex items-center justify-center gap-1 mb-3 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="font-semibold">{stat.change}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{stat.title}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Chart Placeholders Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("marketInsights.charts.title", "Market Data Visualization")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("marketInsights.charts.subtitle", "Interactive charts and graphs showing market trends, pricing patterns, and demand analytics.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Chart Placeholder 1 */}
            <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 mx-auto mb-6">
                <LineChart size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("marketInsights.charts.rentalTrends", "Rental Rate Trends")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("marketInsights.charts.rentalTrendsDesc", "24-month historical rental rate progression across different property types and neighborhoods.")}
              </p>
              <div className="bg-white p-4 border">
                <div className="text-sm text-gray-500 mb-2">Sample Data Preview:</div>
                <div className="flex justify-between text-xs">
                  <span>Jan '23: $2,950</span>
                  <span>Jul '24: $3,247</span>
                  <span>Current: $3,280</span>
                </div>
              </div>
            </div>

            {/* Chart Placeholder 2 */}
            <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-purple-100 text-purple-600 mx-auto mb-6">
                <BarChart3 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("marketInsights.charts.occupancyRates", "Occupancy by Neighborhood")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("marketInsights.charts.occupancyRatesDesc", "Comparative occupancy rates across Toronto's primary executive housing districts.")}
              </p>
              <div className="bg-white p-4 border">
                <div className="text-sm text-gray-500 mb-2">Current Occupancy:</div>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between"><span>Waterfront:</span><span>97.3%</span></div>
                  <div className="flex justify-between"><span>Downtown:</span><span>96.2%</span></div>
                  <div className="flex justify-between"><span>Midtown:</span><span>95.1%</span></div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder 3 */}
            <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 mx-auto mb-6">
                <PieChart size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("marketInsights.charts.demandSources", "Demand by Industry")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("marketInsights.charts.demandSourcesDesc", "Corporate housing demand breakdown by industry sector and company size.")}
              </p>
              <div className="bg-white p-4 border">
                <div className="text-sm text-gray-500 mb-2">Top Industries:</div>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between"><span>Technology:</span><span>34%</span></div>
                  <div className="flex justify-between"><span>Financial:</span><span>28%</span></div>
                  <div className="flex justify-between"><span>Consulting:</span><span>18%</span></div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder 4 */}
            <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-600 mx-auto mb-6">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("marketInsights.charts.forecastModel", "12-Month Forecast")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("marketInsights.charts.forecastModelDesc", "Predictive modeling for rental rates, occupancy, and market demand through 2025.")}
              </p>
              <div className="bg-white p-4 border">
                <div className="text-sm text-gray-500 mb-2">Projected Growth:</div>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between"><span>Q4 2024:</span><span>+3.2%</span></div>
                  <div className="flex justify-between"><span>Q2 2025:</span><span>+5.7%</span></div>
                  <div className="flex justify-between"><span>Annual:</span><span>+8.9%</span></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Key Insights */}
      <Section id="insights" className="py-20 bg-blue-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("marketInsights.insights.title", "Key Market Insights")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("marketInsights.insights.subtitle", "Expert analysis of current market conditions and emerging trends affecting Toronto's executive housing sector.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {keyInsights.map((insight, index) => (
              <div key={index} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {insight.title}
                  </h3>
                  <div className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold ${
                    insight.impact === 'High' ? 'bg-red-100 text-red-800' : 
                    insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    <Info size={14} />
                    {insight.impact} Impact
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-4">
                  {insight.description}
                </p>
                
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  insight.trend === 'up' ? 'text-green-600' : 
                  insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {insight.trend === 'up' && <TrendingUp size={16} />}
                  {insight.trend === 'down' && <TrendingDown size={16} />}
                  <span>Trend: {insight.trend === 'up' ? 'Increasing' : insight.trend === 'down' ? 'Decreasing' : 'Stable'}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Neighborhood Analysis */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("marketInsights.neighborhoods.title", "Neighborhood Performance")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("marketInsights.neighborhoods.subtitle", "Comparative analysis of Toronto's premium neighborhoods for executive housing investment and occupancy.")}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Neighborhood</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Avg. Monthly Rate</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Occupancy Rate</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">YoY Growth</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Market Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {neighborhoodData.map((neighborhood, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-blue-600" />
                        <span className="font-medium text-gray-900">{neighborhood.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-900">
                        ${neighborhood.avgRate.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 ${
                        neighborhood.occupancy >= 95 ? 'text-green-600' : 
                        neighborhood.occupancy >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        <span className="font-semibold">{neighborhood.occupancy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <TrendingUp size={16} />
                        <span className="font-semibold">+{neighborhood.growth}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold ${
                        neighborhood.avgRate >= 4000 ? 'bg-purple-100 text-purple-800' :
                        neighborhood.avgRate >= 3000 ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {neighborhood.avgRate >= 4000 ? 'Luxury' : 
                         neighborhood.avgRate >= 3000 ? 'Premium' : 'Value'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* Market Forecasts */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("marketInsights.forecasts.title", "Market Forecasts")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("marketInsights.forecasts.subtitle", "Expert predictions and analysis for Toronto's executive housing market outlook.")}
            </p>
          </div>
          
          <div className="space-y-8">
            {marketForecasts.map((forecast, index) => (
              <div key={index} className="bg-white p-8 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{forecast.period}</h3>
                  <span className={`px-3 py-1 text-sm font-semibold ${
                    forecast.confidence === 'High' ? 'bg-green-100 text-green-800' :
                    forecast.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {forecast.confidence} Confidence
                  </span>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {forecast.prediction}
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Factors:</h4>
                  <ul className="space-y-2">
                    {forecast.keyFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Download Report Section */}
      <Section id="download" className="py-20 bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {t("marketInsights.form.title", "Download Complete Market Report")}
                  </h2>
                  <p className="text-xl text-blue-100">
                    {t("marketInsights.form.subtitle", "Access our comprehensive market analysis including detailed charts, forecasts, and investment insights.")}
                  </p>
                </div>

                {/* Report Types */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                  {reportTypes.map((report) => (
                    <div key={report.type} className="bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText size={24} className="text-blue-200" />
                        <h3 className="text-xl font-bold">{report.title}</h3>
                      </div>
                      <p className="text-blue-100 mb-4 text-sm">{report.description}</p>
                      <ul className="space-y-1">
                        {report.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                            <CheckCircle2 size={14} className="text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 text-gray-900 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("marketInsights.form.firstName", "First Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("marketInsights.form.firstNamePlaceholder", "Enter your first name")}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("marketInsights.form.lastName", "Last Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("lastName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("marketInsights.form.lastNamePlaceholder", "Enter your last name")}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("marketInsights.form.email", "Email Address")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder={t("marketInsights.form.emailPlaceholder", "your@email.com")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("marketInsights.form.company", "Company")}
                      </label>
                      <input
                        {...register("company")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("marketInsights.form.companyPlaceholder", "Your company name")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("marketInsights.form.jobTitle", "Job Title")}
                      </label>
                      <input
                        {...register("jobTitle")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("marketInsights.form.jobTitlePlaceholder", "Your job title")}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("marketInsights.form.reportType", "Preferred Report Type")}
                    </label>
                    <select
                      {...register("reportType")}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">{t("marketInsights.form.selectReport", "Select report type")}</option>
                      <option value="quarterly">{t("marketInsights.form.quarterly", "Quarterly Report")}</option>
                      <option value="annual">{t("marketInsights.form.annual", "Annual Analysis")}</option>
                      <option value="custom">{t("marketInsights.form.custom", "Custom Research")}</option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t("marketInsights.form.interests", "Areas of Interest")}
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {interestOptions.map((interest) => (
                        <label key={interest} className="flex items-center gap-3 p-3 border border-gray-300 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedInterests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                            className="text-blue-600"
                          />
                          <span className="text-sm">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-4 px-8 text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {t("marketInsights.form.submitting", "Processing...")}
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        {t("marketInsights.form.submit", "Download Market Report")}
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {t("marketInsights.form.success.title", "Report Download Ready!")}
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                  {t("marketInsights.form.success.message", "Thank you! Your market report is being prepared and will be emailed to you within the next few minutes. Check your inbox for the download link.")}
                </p>
                <button className="bg-white text-indigo-900 px-8 py-3 font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mx-auto">
                  <Mail size={16} />
                  {t("marketInsights.form.success.checkEmail", "Check Your Email")}
                </button>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}