async function callPricing(){
  if(
    !projectType.value ||
    !experience.value ||
    !projectSize.value ||
    !clientClarity.value ||
    !timeline.value
  ){
    alert("Please fill all required fields");
    return;
  }

  const payload = {
    projectType: projectType.value,
    experience: experience.value,
    size: projectSize.value,
    clarity: clientClarity.value,
    timeline: timeline.value,
    context: pricingContext.value
  };

  const res = await fetch("/api/pricing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  pricingOutput.value = data.output;
  pricingResult.classList.remove("hidden");
}

function resetPricing(){
  projectType.selectedIndex = 0;
  experience.selectedIndex = 0;
  projectSize.selectedIndex = 0;
  clientClarity.selectedIndex = 0;
  timeline.selectedIndex = 0;
  pricingContext.value = "";
  pricingResult.classList.add("hidden");
}
