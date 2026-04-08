import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AhaMoment } from "@/components/AhaMoment";

const props = {
  lifePathNumber: 7,
  archetype: "El Analista Profundo",
  archetypeDescription: "Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar.",
  onContinue: vi.fn(),
};

describe("AhaMoment", () => {
  it("renders the life path number", () => {
    render(<AhaMoment {...props} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the archetype name", () => {
    render(<AhaMoment {...props} />);
    expect(screen.getByText("El Analista Profundo")).toBeInTheDocument();
  });

  it("renders the archetype description", () => {
    render(<AhaMoment {...props} />);
    expect(screen.getByText(props.archetypeDescription)).toBeInTheDocument();
  });

  it("renders the dashboard CTA button", () => {
    render(<AhaMoment {...props} />);
    expect(screen.getByRole("button", { name: /ver mi dashboard/i })).toBeInTheDocument();
  });

  it("calls onContinue when the CTA button is clicked", async () => {
    const onContinue = vi.fn();
    render(<AhaMoment {...props} onContinue={onContinue} />);
    await userEvent.click(screen.getByRole("button", { name: /ver mi dashboard/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
