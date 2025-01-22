import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Button } from "~/components/ui/button"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
      <Welcome />;
    </div>
  )
}

