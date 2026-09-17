# HORIZON Goals

## Primary Objectives

### 1. Run the daily loop end to end on one book
- Actuals arrive → DataEngineer reconciles and versions
- PostAnalyst scores yesterday's forecast and decomposes the miss
- Scout matches events to the miss and proposes new ones
- CausalAnalyst updates open hypotheses where a test now has data
- Forecaster proposes the reforecast with its assumption register
- Evaluator passes or blocks → planner gate → Reporter publishes the daily note
- IEX adapter writes the forecast file

### 2. Recover a known ground truth from synthetic data
- Flag the handle-time level shift at go-live within days, not weeks
- Separate the supply-side regime break from the demand trend
- Isolate the outage day and the weather day from the trend
- Flag growth without population, with three hypotheses and their tests
- Catch the metric with two definitions in circulation
- Reject the benchmark carried from another book

### 3. Enforce the grade and the rung on every output
- Every number carries [M], [C], [E] or [A]
- Every number cites the definition it was computed under
- No carried assumption reaches a human unlabeled
- No Rung 1 finding is presented as a cause
- The Evaluator reviews every reforecast, plan and answer card before the gate

### 4. Turn questions into a knowledge base
- Every performance question opens an XR row with a hypothesis table
- Every answered question becomes a graded answer card in 06-questions/
- The register report lists open questions with staleness flags

### 5. Produce the monthly plan in the shape the business consumes
- Requirement hours → FTE → roster shape → gap, by channel
- Scenario pack with the assumption register attached
- Anaplan-shaped export
- Planner sign-off recorded in the CHANGELOG

## Success Metrics

| Metric | Target |
|--------|--------|
| Numbers carrying a grade | 100% |
| Numbers citing a definition | 100% |
| Carried assumptions labeled | 100% |
| Causal claims that passed the Evaluator | 100% |
| Plan changes that passed a human gate | 100% |
| Performance questions answered as a graded card within 48 hours | 100% |
| Ground-truth drivers recovered in the demo run | all eight |
