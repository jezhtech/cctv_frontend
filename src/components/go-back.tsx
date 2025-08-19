import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GoBack = () => {
  const navigate = useNavigate();
  return (
    <Button variant="outline" onClick={() => navigate(-1)}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
};
