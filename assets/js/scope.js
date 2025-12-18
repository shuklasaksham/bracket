/* =========================
   SCOPE — CLIENT LOGIC
========================= */

function getChecked(id){
  return [...document.querySelectorAll(`#${id} input:checked`)]
    .map(i => i.value);
}

async function generateScope(){
  if(!workType || !workType.value){
    alert("Please select type of work");
    return;
  }

  if(!coverage.value || !revisions.value || !feedback.value || !changes.value){
    alert("Please complete all required fields");
    return;
  }

  const payload = {
    workType: workType.value,
    deliverables: getChecked("deliverables"),
    coverage: coverage.value,
    revisions: revisions.value,
    feedback: feedback.value,
    changes: changes.value,
    dependencies: getChecked("dependencies"),
    exclusions: getChecked("exclusions"),
    context: scopeContext.value
  };

  const res = await fetch("/api/scope", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  scopeOutput.value = data.output;
  scopeResult.classList.remove("hidden");

  autoResize(scopeOutput);
}

function resetScope(){
  document.querySelectorAll('#scope select')
    .forEach(s => s.selectedIndex = 0);

  document.querySelectorAll('#scope textarea')
    .forEach(t => t.value = "");

  document.querySelectorAll('#scope input[type="checkbox"]')
    .forEach(c => c.checked = false);

  scopeResult.classList.add("hidden");
}
