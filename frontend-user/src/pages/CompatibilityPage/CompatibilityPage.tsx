import React, { useState, useCallback, useMemo, useEffect } from "react";
import styles from "./CompatibilityPage.module.css";

import useVehicleFilter from "../../hooks/useVehicleFilter";
import useEquipements from "../../hooks/useEquipments";
import useCart from "../../hooks/useCart";
import useAsyncState from "../../hooks/useAsyncState";

import axiosInstance from "../../api/axiosInstance";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";

import { MOCK_CATEGORIES } from "../../mocks/categories.mock";

import type { PartResponse } from "../../types/part.types";
import type { VehiculeResponse } from "../../types/vehicule.types";
import type { UUID } from "../../types/common.types";

type Step = 0 | 1 | 2;

const CompatibilityPage: React.FC = () => {
  const [step, setStep] = useState<Step>(0);

  // ───────────────── VEHICLE ─────────────────
  const {
    selectedVehicleId,
    compatibleParts,
    loading: partsLoading,
    error: partsError,
    selectVehicle,
    clearVehicle,
  } = useVehicleFilter();

  const vehiclesAsync = useAsyncState<VehiculeResponse[]>([]);

useEffect(() => {
  vehiclesAsync.setLoading();

  axiosInstance
    .get<VehiculeResponse[]>("/api/vehicules")
    .then((res) => {
      const vehicles = Array.isArray(res.data) ? res.data : [];
      vehiclesAsync.setSuccess(vehicles);
    })
    .catch((err) =>
      vehiclesAsync.setError(err, "Impossible de charger les véhicules.")
    );
}, []);

  const selectedVehicle = useMemo(() => {
    const list = Array.isArray(vehiclesAsync.state.data)
        ? vehiclesAsync.state.data
        : [];

    return list.find(v => v.id === selectedVehicleId);
}, [vehiclesAsync.state.data, selectedVehicleId]);
  // ───────────────── CATEGORY ─────────────────
  const { equipements } = useEquipements();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
  const seen = new Set<string>();

  return equipements.reduce<string[]>((acc, e) => {
    const name = e.category?.name;

    if (name && !seen.has(name)) {
      seen.add(name);
      acc.push(name);
    }

    return acc;
  }, []);
}, [equipements]);

  // ───────────────── CART ─────────────────
  const { addToCart, isInCart } = useCart();

  // ───────────────── FILTER ─────────────────
  const [search, setSearch] = useState("");

  const filteredParts = useMemo(() => {
    let result = compatibleParts;

    if (selectedCategory) {
      result = result.filter(
        p => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [compatibleParts, selectedCategory, search]);

  // ───────────────── HANDLERS ─────────────────
  const handleNext = () => setStep(s => Math.min(2, s + 1) as Step);

  const handleBack = () => {
    if (step === 1) clearVehicle();
    if (step === 2) {
      setSelectedCategory(null);
      setSearch("");
    }
    setStep(s => Math.max(0, s - 1) as Step);
  };

  const handleReset = () => {
    clearVehicle();
    setSelectedCategory(null);
    setSearch("");
    setStep(0);
  };

  const handleSelectVehicle = async (id: UUID) => {
    await selectVehicle(id);
  };

  const handleAddToCart = (part: PartResponse) => {
    addToCart(part.id as UUID, 1, part.price);
  };

  // ───────────────── RENDER ─────────────────
  return (
    <div className={styles.layout}>
      <Navbar categories={MOCK_CATEGORIES} />

      <main className={styles.page}>
        <div className={styles.body}>

          {/* STEP 0 */}
          {step === 0 && (
            <>
              {vehiclesAsync.state.loading && <Loading />}
              {vehiclesAsync.state.error && (
                <Error message={vehiclesAsync.state.error} />
              )}

              <div className={styles.grid}>
                {vehiclesAsync.state.data.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVehicle(v.id as UUID)}
                  >
                    {v.name} {v.model} {v.brand.name}
                  </button>
                ))}
              </div>

              <Button
                text="Continuer"
                onClick={handleNext}
                disabled={!selectedVehicleId || partsLoading}
              />
            </>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                {selectedVehicle && (
                  <p>
                    {selectedVehicle.name} {selectedVehicle.model}{" "}
                    {selectedVehicle.brand.name}
                  </p>
                )}
              </div>

              <div className={styles.grid}>
                <button onClick={() => setSelectedCategory(null)}>
                  Toutes ({compatibleParts.length})
                </button>

                {categories.map(cat => {
                  const count = compatibleParts.filter(
                    p =>
                      p.category?.name?.toLowerCase() === cat.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <Button text="Retour" onClick={handleBack} />
              <Button text="Résultats" onClick={handleNext} />
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              {filteredParts.length === 0 ? (
                <p>Aucun résultat</p>
              ) : (
                <ul>
                  {filteredParts.map(part => (
                    <li key={part.id}>
                      {part.name} - {part.price} DH
                      <button
                        onClick={() => handleAddToCart(part)}
                        disabled={isInCart(part.id as UUID)}
                      >
                        Ajouter
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Button text="Retour" onClick={handleBack} />
              <Button text="Reset" onClick={handleReset} />
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompatibilityPage;