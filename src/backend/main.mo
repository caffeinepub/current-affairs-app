import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Set "mo:core/Set";

import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type NewsItem = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    source : Text;
    date : Time.Time;
  };

  module NewsItem {
    public func compare(news1 : NewsItem, news2 : NewsItem) : Order.Order {
      Text.compare(news1.title, news2.title);
    };

    public func compareByDate(news1 : NewsItem, news2 : NewsItem) : Order.Order {
      if (news1.date < news2.date) { #less } else if (news1.date > news2.date) { #greater } else {
        Text.compare(news1.title, news2.title);
      };
    };
  };

  type UserProgress = {
    currentStreak : Nat;
    totalDaysCompleted : Nat;
    totalDaysInProgram : Nat;
    lastCompletedDate : Time.Time;
  };

  type UserProfile = {
    id : Principal;
    name : Text;
    email : Text;
    testsAttempted : Nat;
    totalScore : Nat;
  };

  type UserStats = {
    testsAttempted : Nat;
    totalScore : Nat;
    accuracy : Float;
  };

  let newsItems = Map.empty<Nat, NewsItem>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let completedDays = Set.empty<Int>();

  stable var nextNewsItemId = 1;

  var userProgress : UserProgress = {
    currentStreak = 0;
    totalDaysCompleted = 0;
    totalDaysInProgram = 0;
    lastCompletedDate = 0;
  };

  public shared ({ caller }) func addNewsItem(title : Text, description : Text, category : Text, source : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can add news items");
    };
    let newsItemId = nextNewsItemId;
    let newsItem : NewsItem = {
      id = newsItemId;
      title;
      description;
      category;
      source;
      date = Time.now();
    };
    newsItems.add(newsItemId, newsItem);
    nextNewsItemId += 1;
  };

  public query ({ caller }) func getNewsItem(id : Nat) : async NewsItem {
    switch (newsItems.get(id)) {
      case (null) { Runtime.trap("News item does not exist") };
      case (?newsItem) { newsItem };
    };
  };

  public query ({ caller }) func getAllNewsItems() : async [NewsItem] {
    newsItems.values().toArray().sort();
  };

  public query ({ caller }) func getAllNewsItemsByDate() : async [NewsItem] {
    newsItems.values().toArray().sort(NewsItem.compareByDate);
  };

  public shared ({ caller }) func markDayCompleted() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let today = Time.now() / 86_400_000_000_000;
    if (completedDays.contains(today)) { Runtime.trap("Day already marked as completed") };
    completedDays.add(today);
    let newCurrentStreak = if (userProgress.lastCompletedDate == today - 1) {
      userProgress.currentStreak + 1;
    } else {
      1;
    };
    userProgress := {
      userProgress with
      currentStreak = newCurrentStreak;
      totalDaysCompleted = userProgress.totalDaysCompleted + 1;
      totalDaysInProgram = userProgress.totalDaysInProgram + 1;
      lastCompletedDate = today;
    };
  };

  public query ({ caller }) func getUserProgress() : async UserProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    userProgress;
  };

  public shared ({ caller }) func prepopulateNewsItems() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin users can prepopulate news");
    };
    await addNewsItem(
      "Global Warming Effects Intensify",
      "New studies show an increase in global temperatures affecting ecosystems...",
      "Environment",
      "BBC"
    );
    await addNewsItem(
      "Tech Stocks Surge in Q1",
      "The technology sector has seen a significant rise in stock prices in the first quarter...",
      "Finance",
      "Reuters"
    );
    await addNewsItem(
      "New Advances in AI Technology",
      "Artificial Intelligence is transforming multiple industries with new breakthroughs...",
      "Technology",
      "TechCrunch"
    );
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveProfile(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update/create a profile");
    };
    let existingProfile = userProfiles.get(caller);
    let newProfile = switch (existingProfile) {
      case (null) {
        {
          id = caller;
          name;
          email;
          testsAttempted = 0;
          totalScore = 0;
        };
      };
      case (?profile) {
        {
          profile with
          id = caller;
          name;
          email;
        };
      };
    };
    userProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func incrementTestsAttempted(score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist, please create profile first") };
      case (?profile) {
        let updatedProfile = {
          profile with
          testsAttempted = profile.testsAttempted + 1;
          totalScore = profile.totalScore + score;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMyStats() : async UserStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        {
          testsAttempted = 0;
          totalScore = 0;
          accuracy = 0.0;
        };
      };
      case (?profile) {
        {
          testsAttempted = profile.testsAttempted;
          totalScore = profile.totalScore;
          accuracy = if (profile.testsAttempted == 0) { 0.0 } else {
            (profile.totalScore.toFloat() * 100.0) / (profile.testsAttempted.toFloat() * 100.0);
          };
        };
      };
    };
  };
};
