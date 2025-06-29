import { api } from "../hooks/olx-api";
import { Button } from '@/components/ui/button';


export function ConnectOlxButton() {
  const handleClick = async () => {
    const { data } = await api.get<{ auth_url: string }>("/olx/connect");
    window.location.href = data.auth_url;      // skok na olx.pl (krok 1 OAuth)
  };

  return (
    <Button
        variant="outline"
        className="text-teal-500 border-teal-500"
        onClick={handleClick}
        style={{ padding: "0.6rem 1rem", fontSize: "1rem" }}
    >
      Połącz z OLX
    </Button>
  );
}



    // variant="outline"
    // className="text-teal-500 border-teal-500"
    // onClick={() => setShowManual(true)}
    // >
    // Manual Connect