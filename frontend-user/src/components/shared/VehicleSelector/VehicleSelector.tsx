import React, { useCallback, useMemo, useState } from "react";
import "../../../styles/components/VehicleSelector.css";
import { useVehicle } from "../../../hooks/useVehicle";
import { useVehiculeCatalog } from "../../../hooks/useVehiculeCatalog";
import {
  displayVehiculeModel,
  vehiculeToSelectedVehicle,
} from "../../../services/vehiculeService";
import type { VehiculeResponse } from "../../../types/vehicule.types";

/**
 * Navbar-friendly motorcycle picker: brand → model, then save into the global vehicle store.
 *
 * **Behavior**
 * - Catalog data comes from product-service (`GET /api/vehicule-brands`, `GET /api/vehicules`).
 * - Draft edits use local state; once the user clicks "Enregistrer", `setVehicle` persists via Zustand.
 * - When a vehicle is saved, the summary line shows brand + model; "Retirer" calls `clearVehicle`.
 * - Changing brand resets the model draft to avoid mismatched pairs.
 */
const VehicleSelector: React.FC = () => {
  const { selectedVehicle, setVehicle, clearVehicle } = useVehicle();
  const { brands, vehicules, isLoading, isError, refetch } = useVehiculeCatalog();

  const vehiculeFromCatalog = useMemo(
    () => (selectedVehicle ? vehicules.find((x) => x.id === selectedVehicle.id) : undefined),
    [selectedVehicle, vehicules],
  );

  /** True after the user edits selects; false when the store is the source of truth for the selects. */
  const [dirty, setDirty] = useState(false);
  const [draftBrandId, setDraftBrandId] = useState("");
  const [draftVehiculeId, setDraftVehiculeId] = useState("");

  const brandValue = dirty ? draftBrandId : (vehiculeFromCatalog?.brand.id ?? "");
  const modelValue = dirty ? draftVehiculeId : (vehiculeFromCatalog?.id ?? "");

  const handleRemove = useCallback(() => {
    clearVehicle();
    setDirty(false);
    setDraftBrandId("");
    setDraftVehiculeId("");
  }, [clearVehicle]);

  const modelsForBrand = useMemo((): VehiculeResponse[] => {
    if (!brandValue) return [];
    return vehicules
      .filter((v) => v.brand.id === brandValue)
      .sort((a, b) => displayVehiculeModel(a).localeCompare(displayVehiculeModel(b)));
  }, [brandValue, vehicules]);

  const handleBrandChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDirty(true);
    setDraftBrandId(e.target.value);
    setDraftVehiculeId("");
  }, []);

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDirty(true);
      setDraftBrandId((prev) => prev || vehiculeFromCatalog?.brand.id || "");
      setDraftVehiculeId(e.target.value);
    },
    [vehiculeFromCatalog?.brand.id],
  );

  const handleApply = useCallback(() => {
    if (!brandValue || !modelValue) return;
    const found = vehicules.find((v) => v.id === modelValue);
    if (found) {
      setVehicle(vehiculeToSelectedVehicle(found));
      setDirty(false);
      setDraftBrandId("");
      setDraftVehiculeId("");
    }
  }, [brandValue, modelValue, vehicules, setVehicle]);

  const canApply = dirty && Boolean(brandValue && modelValue);

  if (isLoading) {
    return (
      <div className="vehicle-selector" aria-label="Sélection du véhicule">
        <span className="vehicle-selector__label">Ma moto</span>
        <p className="vehicle-selector__current">Chargement du catalogue…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="vehicle-selector" aria-label="Sélection du véhicule">
        <span className="vehicle-selector__label">Ma moto</span>
        <p className="vehicle-selector__current">Impossible de charger les marques / modèles.</p>
        <button type="button" className="vehicle-selector__apply" onClick={() => void refetch()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-selector" aria-label="Sélection du véhicule">
      <span className="vehicle-selector__label">Ma moto</span>

      {selectedVehicle ? (
        <div className="vehicle-selector__row">
          <p className="vehicle-selector__current">
            <strong>
              {selectedVehicle.brandName} {selectedVehicle.modelName}
            </strong>
            {selectedVehicle.year !== undefined ? ` (${selectedVehicle.year})` : null}
          </p>
          <button type="button" className="vehicle-selector__clear" onClick={handleRemove}>
            Retirer
          </button>
        </div>
      ) : null}

      <div className="vehicle-selector__controls">
        <select
          className="vehicle-selector__select"
          aria-label="Marque moto"
          value={brandValue}
          onChange={handleBrandChange}
        >
          <option value="">Marque</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="vehicle-selector__select"
          aria-label="Modèle moto"
          value={modelValue}
          onChange={handleModelChange}
          disabled={!brandValue}
        >
          <option value="">Modèle</option>
          {modelsForBrand.map((v) => (
            <option key={v.id} value={v.id}>
              {displayVehiculeModel(v)}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="vehicle-selector__apply"
          onClick={handleApply}
          disabled={!canApply}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default VehicleSelector;
