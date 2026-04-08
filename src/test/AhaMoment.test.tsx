import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AhaMoment } from "@/components/AhaMoment";

const props = {
  lifePathNumber: 7,
  archetype: "El Analista Profundo",
  archetypeDescription: "Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar.",
};

describe("AhaMoment", () => {
  it("renders the life path number", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the archetype name", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText("El Analista Profundo")).toBeInTheDocument();
  });

  it("renders the archetype description", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText(props.archetypeDescription)).toBeInTheDocument();
  });

  it("renders the dashboard CTA button", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /ver mi dashboard/i })).toBeInTheDocument();
  });
});
