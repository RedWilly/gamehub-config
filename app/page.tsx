import { Button } from '@/components/ui/button';
import { TowerControl as GameController } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <GameController className="h-16 w-16 mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tighter mb-4">
            GameHub Configuration Directory
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
            A community-powered platform for sharing and discovering optimized game configurations
            for the GameHub emulator.
          </p>
          <div className="flex gap-4">
            <Button size="lg">
              Browse Configs
            </Button>
            <Button size="lg" variant="outline">
              Submit Config
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}