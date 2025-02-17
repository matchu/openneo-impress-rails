import React from "react";
import { useToast } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebounce } from "../util";
import useCurrentUser from "../components/useCurrentUser";
import { outfitStatesAreEqual } from "./useOutfitState";
import { useSaveOutfitMutation } from "../loaders/outfits";

function useOutfitSaving(outfitState, dispatchToOutfit) {
  const { isLoggedIn, id: currentUserId } = useCurrentUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Whether this outfit is new, i.e. local-only, i.e. has _never_ been saved
  // to the server.
  const isNewOutfit = outfitState.id == null;

  // Whether this outfit's latest local changes have been saved to the server.
  // And log it to the console!
  const latestVersionIsSaved =
    outfitState.savedOutfitState &&
    outfitStatesAreEqual(
      outfitState.outfitStateWithoutExtras,
      outfitState.savedOutfitState,
    );
  React.useEffect(() => {
    console.debug(
      "[useOutfitSaving] Latest version is saved? %s\nCurrent: %o\nSaved: %o",
      latestVersionIsSaved,
      outfitState.outfitStateWithoutExtras,
      outfitState.savedOutfitState,
    );
  }, [
    latestVersionIsSaved,
    outfitState.outfitStateWithoutExtras,
    outfitState.savedOutfitState,
  ]);

  // Only logged-in users can save outfits - and they can only save new outfits,
  // or outfits they created.
  const canSaveOutfit =
    isLoggedIn && (isNewOutfit || outfitState.creator?.id === currentUserId);

  // Users can delete their own outfits too. The logic is slightly different
  // than for saving, because you can save an outfit that hasn't been saved
  // yet, but you can't delete it.
  const canDeleteOutfit = !isNewOutfit && canSaveOutfit;

  const saveOutfitMutation = useSaveOutfitMutation({
    onSuccess: (outfit) => {
      if (outfit.id === outfitState.id && outfit.name !== outfitState.name) {
        dispatchToOutfit({
          type: "rename",
          outfitName: outfit.name,
        });
      }
    },
  });
  const isSaving = saveOutfitMutation.isPending;
  const saveError = saveOutfitMutation.error;

  const saveOutfitFromProvidedState = React.useCallback(
    (outfitState) => {
      saveOutfitMutation
        .mutateAsync({
          id: outfitState.id,
          name: outfitState.name,
          speciesId: outfitState.speciesId,
          colorId: outfitState.colorId,
          pose: outfitState.pose,
          wornItemIds: [...outfitState.wornItemIds],
          closetedItemIds: [...outfitState.closetedItemIds],
        })
        .then((outfit) => {
          // Navigate to the new saved outfit URL. Our Apollo cache should pick
          // up the data from this mutation response, and combine it with the
          // existing cached data, to make this smooth without any loading UI.
          if (pathname !== `/outfits/[outfitId]`) {
            navigate(`/outfits/${outfit.id}`);
          }
        })
        .catch((e) => {
          console.error(e);
          toast({
            status: "error",
            title: "Sorry, there was an error saving this outfit!",
            description: "Maybe check your connection and try again.",
          });
        });
    },
    // It's important that this callback _doesn't_ change when the outfit
    // changes, so that the auto-save effect is only responding to the
    // debounced state!
    [saveOutfitMutation, pathname, navigate, toast],
  );

  const saveOutfit = React.useCallback(
    () => saveOutfitFromProvidedState(outfitState.outfitStateWithoutExtras),
    [saveOutfitFromProvidedState, outfitState.outfitStateWithoutExtras],
  );

  // Auto-saving! First, debounce the outfit state. Use `outfitStateWithoutExtras`,
  // which only contains the basic fields, and will keep a stable object
  // identity until actual changes occur. Then, save the outfit after the user
  // has left it alone for long enough, so long as it's actually different
  // than the saved state.
  const debouncedOutfitState = useDebounce(
    outfitState.outfitStateWithoutExtras,
    2000,
    {
      // When the outfit ID changes, update the debounced state immediately!
      forceReset: (debouncedOutfitState, newOutfitState) =>
        debouncedOutfitState.id !== newOutfitState.id,
    },
  );
  // HACK: This prevents us from auto-saving the outfit state that's still
  //       loading. I worry that this might not catch other loading scenarios
  //       though, like if the species/color/pose is in the GQL cache, but the
  //       items are still loading in... not sure where this would happen tho!
  const debouncedOutfitStateIsSaveable =
    debouncedOutfitState.speciesId &&
    debouncedOutfitState.colorId &&
    debouncedOutfitState.pose;
  React.useEffect(() => {
    if (
      !isNewOutfit &&
      canSaveOutfit &&
      !isSaving &&
      !saveError &&
      debouncedOutfitStateIsSaveable &&
      !outfitStatesAreEqual(debouncedOutfitState, outfitState.savedOutfitState)
    ) {
      console.info(
        "[useOutfitSaving] Auto-saving outfit\nSaved: %o\nCurrent (debounced): %o",
        outfitState.savedOutfitState,
        debouncedOutfitState,
      );
      saveOutfitFromProvidedState(debouncedOutfitState);
    }
  }, [
    isNewOutfit,
    canSaveOutfit,
    isSaving,
    saveError,
    debouncedOutfitState,
    debouncedOutfitStateIsSaveable,
    outfitState.savedOutfitState,
    saveOutfitFromProvidedState,
  ]);

  // When the outfit changes, clear out the error state from previous saves.
  // We'll send the mutation again after the debounce, and we don't want to
  // show the error UI in the meantime!
  const resetMutation = saveOutfitMutation.reset;
  React.useEffect(
    () => resetMutation(),
    [outfitState.outfitStateWithoutExtras, resetMutation],
  );

  return {
    canSaveOutfit,
    canDeleteOutfit,
    isNewOutfit,
    isSaving,
    latestVersionIsSaved,
    saveError,
    saveOutfit,
  };
}

export default useOutfitSaving;
