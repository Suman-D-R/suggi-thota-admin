"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

export function SettingsManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="app" className="space-y-4">
        <TabsList>
          <TabsTrigger value="app">App Settings</TabsTrigger>
          <TabsTrigger value="tax">Tax & GST</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          <TabsTrigger value="notifications">Notification Templates</TabsTrigger>
          <TabsTrigger value="sla">SLA & Cut-off Times</TabsTrigger>
        </TabsList>

        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input id="appName" defaultValue="Vitura" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appUrl">App URL</Label>
                <Input id="appUrl" defaultValue="https://vitura.com" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-slate-500">Enable maintenance mode</p>
                </div>
                <Switch />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax & GST</CardTitle>
              <CardDescription>Configure tax rates and GST settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input id="gstRate" type="number" defaultValue="18" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                <Input id="cgstRate" type="number" defaultValue="9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                <Input id="sgstRate" type="number" defaultValue="9" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Tax Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Configure payment gateway settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Razorpay</h3>
                    <p className="text-sm text-slate-500">Razorpay payment gateway</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Stripe</h3>
                    <p className="text-sm text-slate-500">Stripe payment gateway</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Cash on Delivery</h3>
                    <p className="text-sm text-slate-500">Enable cash on delivery</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Manage SMS and email notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Notification template management will be available here. You can configure SMS and email templates
                for order confirmations, delivery updates, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA & Cut-off Times</CardTitle>
              <CardDescription>Configure service level agreements and order cut-off times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderCutoff">Order Cut-off Time</Label>
                <Input id="orderCutoff" type="time" defaultValue="22:00" />
                <p className="text-sm text-slate-500">Orders placed after this time will be processed next day</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverySLA">Delivery SLA (minutes)</Label>
                <Input id="deliverySLA" type="number" defaultValue="30" />
                <p className="text-sm text-slate-500">Standard delivery time in minutes</p>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save SLA Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

