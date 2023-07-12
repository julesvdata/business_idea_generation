## import packages
from flask import (
    Flask,
    redirect,
    render_template,
    request,
    url_for,
    send_from_directory,
)
import json
import utils
import os
import yaml

## config
## path to openai key
PATH_TO_OPENAI_KEY = "./openai.yaml"
## max openai api tries per request
MAX_API_TRIES = 5

# get openai key
with open(PATH_TO_OPENAI_KEY, "r") as stream:
    OPENAI_KEY = yaml.safe_load(stream)["key"]

## config Flask app ##
app = Flask(__name__)
app.debug = True


## favicon endpoint ##
@app.route("/favicon.ico")
def favicon():
    """Return favicon.ico"""
    return send_from_directory(
        os.path.join(app.root_path, "static"),
        "favicon.ico",
        mimetype="image/vnd.microsoft.icon",
    )


## root endpoint
@app.route("/", methods=["POST", "GET"])
def welcome():
    """Redirect to business_ideas"""
    return redirect(url_for("business_ideas"))


## business_ideas endpoint
@app.route("/business_ideas", methods=["POST", "GET"])
def business_ideas():
    """Business Ideas page"""
    subject = request.args.get("subject")
    return render_template("business_ideas.html", subject=subject)


## get initial gpt ideas
@app.route("/get_initial_ai_ideas", methods=["POST"])
def get_initial_ai_ideas():
    """Get initial AI ideas"""
    request_json = request.json

    age = request_json["age"]
    gender = request_json["gender"]
    idea = request_json["idea"]
    trend = request_json["trend"]
    industry = request_json["industry"]

    idea_list = utils.get_initial_ideas(
        OPENAI_KEY,
        MAX_API_TRIES,
        age=age,
        gender=gender,
        idea=idea,
        trend=trend,
        industry=industry,
    )

    return json.dumps({"initial_ideas": idea_list})


## get idea details
@app.route("/get_idea_details", methods=["POST"])
def get_idea_details():
    """Get idea details"""

    request_json = request.json

    detail = request_json.get("detail")
    title = request_json.get("title")
    description = request_json.get("description")
    age = request_json.get("age")
    gender = request_json.get("gender")
    industry = request_json.get("industry")
    trend = request_json.get("trend")

    if detail == "price_point":
        result = utils.get_price_point(
            OPENAI_KEY, MAX_API_TRIES, title=title, description=description
        )
    elif detail == "product_details":
        result = utils.get_product_details(
            OPENAI_KEY, MAX_API_TRIES, title=title, description=description
        )
    elif detail == "tag_lines":
        result = utils.get_tag_lines(
            OPENAI_KEY, MAX_API_TRIES, title=title, description=description
        )
    elif detail == "roadmap":
        result = utils.get_roadmap(
            OPENAI_KEY, MAX_API_TRIES, title=title, description=description
        )
    elif detail == "execution":
        result = utils.get_execution(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )
    elif detail == "campaign_tag_lines":
        result = utils.get_campaign_tag_lines(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )
    elif detail == "tone":
        result = utils.get_tone(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "brand_partners":
        result = utils.get_brand_partners(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "platforms":
        result = utils.get_platforms(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "retailers":
        result = utils.get_retailers(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
        )

    elif detail == "vision":
        result = utils.get_vision(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "objectives":
        result = utils.get_objectives(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "customer_value":
        result = utils.get_customer_value(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "resources_capabilities":
        result = utils.get_resources_capabilities(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "value_proposition":
        result = utils.get_value_proposition(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "revenue_model":
        result = utils.get_revenue_model(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "competitors":
        result = utils.get_competitors(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "target_demographic":
        result = utils.get_target_demographic(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    elif detail == "target_market_size":
        result = utils.get_target_market_size(
            OPENAI_KEY,
            MAX_API_TRIES,
            title=title,
            description=description,
            age=age,
            gender=gender,
            industry=industry,
            trend=trend,
        )

    return json.dumps({"result": result})


## get gpt chat response
@app.route("/getChatResponse", methods=["POST"])
def get_chat_response():
    request_json = request.json
    context = request_json["context"]
    messages = request_json["messages"]
    roles = request_json["roles"]
    idea_type = request_json["idea_type"]

    response = utils.get_chat_response(
        OPENAI_KEY, MAX_API_TRIES, messages, roles, context, idea_type
    )

    return json.dumps({"response": response})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
