import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';

export function TestHero() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Тест HeroUI компонентів</h1>

      <Card>
        <CardBody>
          <p>Це тестова картка HeroUI</p>
        </CardBody>
      </Card>

      <Input label="Тестове поле" placeholder="Введіть щось" />

      <Button color="primary">Тестова кнопка</Button>
    </div>
  );
}
