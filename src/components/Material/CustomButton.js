
import { Button } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";

export const CustomButton = styled(Button)({
  background: "#D93EE7",
  color: "#FFF",
  textTransform: "uppercase",
  fontSize: "18px",
  fontWeight: "bold",
  padding: "10px 20px",
  borderRadius: "10px",
  margin: "20px",
  boxShadow: "0 4px 8px 2px rgba(0, 0, 0, 0.25)",
  "&:hover": {
    background: "#7125AD",
    boxShadow: "0 4px 16px 4px rgba(0, 0, 0, 0.25)",
  },
});

export const CustomButtonGrey = styled(CustomButton)({
  background: "#999",
  "&:hover": {
    background: "#ccc"
  }
})