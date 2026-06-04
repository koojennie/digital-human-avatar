export class MoodleServices {
  API_URL_MOODLE = process.env.MOODLE_API_URL;
  MOODLE_TOKEN = process.env.MOODLE_TOKEN;

  async getUserMoodleByUserId({ moodleUserId }) {
    const params = new URLSearchParams({
      wstoken: this.MOODLE_TOKEN,
      wsfunction: "core_user_get_users_by_field",
      moodlewsrestformat: "json",
      field: "id",
      "values[0]": moodleUserId,
    });

    const url = `${this.API_URL_MOODLE}/webservice/rest/server.php?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch Moodle user");
    }

    return res.json();
  }
}
