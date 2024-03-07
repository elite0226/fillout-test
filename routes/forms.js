var express = require("express");
var axios = require("axios");
var router = express.Router();

const filloutApiKey =
  "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";

router.get("/:formId/filteredResponses", async (req, res) => {
  try {
    const { formId } = req.params;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

    const response = await axios.get(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${filloutApiKey}`,
        },
      }
    );

    const filteredResponses = applyFilters(response.data, filters);

    res.json(filteredResponses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function applyFilters(data, filters) {
  return {
    responses: data.responses.filter((response) => {
      return filters.every((filter) => {
        const question = response.questions.find((q) => q.id === filter.id);
        if (!question) return false;

        switch (filter.condition) {
          case "equals":
            return question.value === filter.value;
          case "does_not_equal":
            return question.value !== filter.value;
          case "greater_than":
            return question.value > filter.value;
          case "less_than":
            return question.value < filter.value;
          default:
            return false;
        }
      });
    }),
    totalResponses: data.totalResponses,
    pageCount: data.pageCount,
  };
}

module.exports = router;
