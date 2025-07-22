import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientFormProps {
  onClientAdded: () => void;
}

export function ClientForm({ onClientAdded }: ClientFormProps) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
        }),
      });

      if (response.ok) {
        setName('');
        setPhone('');
        setEmail('');
        onClientAdded();
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="clients-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
          👤 Añadir Nuevo Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-700 font-medium">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente"
                required
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-purple-700 font-medium">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Número de teléfono"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-700 font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Dirección de correo"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !name.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-2.5 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? '✨ Añadiendo Cliente...' : '🎉 Añadir Cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
