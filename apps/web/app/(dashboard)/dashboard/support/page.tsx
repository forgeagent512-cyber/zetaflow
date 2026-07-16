"use client";

import { useState } from "react";
import { LifeBuoy, MessageSquare, Mail, Phone, Search, ArrowRight, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageTransition, AnimatedSection } from "@/components/animations";
import { PageHeader } from "@/components/shared/page-header";

const faqs = [
  { q: "How do I create a new AI employee?", a: "Navigate to the Employees section and click 'Add Employee'. Follow the setup wizard to configure your AI employee's role, skills, and behaviors." },
  { q: "Can I integrate with external tools?", a: "Yes! BUILDAGENT supports 200+ integrations through our Automation Store. You can connect with CRMs, marketing tools, support platforms, and more." },
  { q: "How does billing work?", a: "You'll be billed monthly based on your plan. We accept all major credit cards and offer annual billing with a 20% discount." },
  { q: "What happens if I exceed my plan limits?", a: "You'll receive notifications as you approach your limits. You can upgrade your plan at any time from the Billing section." },
];

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Support"
          description="Get help with your BUILDAGENT platform."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Support" },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time.</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Send us an email and we'll get back to you.</p>
              <Button variant="outline" className="w-full">support@buildagent.io</Button>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Available for Enterprise customers 24/7.</p>
              <Button variant="outline" className="w-full">+1 (555) 000-0000</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Describe your issue..." rows={5} />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
